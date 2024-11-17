use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use std::str::FromStr;

pub fn app_verifier_address() -> Pubkey {
    Pubkey::from_str("5cjLQKYMciTuqCxdtpUkH7CsLrp1FY2qe2uEhvfePnFr").unwrap()
}

declare_id!("9KoFUYa8gA9FxE5X1JfTcmjyCjvSzkjiW41BymM7mUZK");

#[program]
pub mod auditingx_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, client_address: Pubkey, github_username: String) -> Result<()> {
        require!(ctx.accounts.verifier.key == &app_verifier_address(), CustomError::Unauthorized);
    
        let dao_account = &mut ctx.accounts.dao_account;
        dao_account.owner = client_address;
        dao_account.repositories = Vec::new(); 
        dao_account.github_username = github_username;
        Ok(())
    }

    pub fn create_repository(ctx: Context<CreateRepository>, name: String, github_url: String, reward_balance: u64) -> Result<()> {
        let dao_account = &mut ctx.accounts.dao_account;

        // Check if repository with this github_url already exists
        if let Some(existing_repo) = dao_account.repositories.iter_mut()
            .find(|r| r.github_url == github_url) 
        {
            // If found, reactivate it if inactive
            require!(
                existing_repo.status == RepoStatus::Inactive,
                CustomError::RepositoryAlreadyActive
            );
            
            existing_repo.status = RepoStatus::Active;
            existing_repo.balance = existing_repo.balance.checked_add(reward_balance)
                .ok_or(CustomError::ArithmeticError)?;
            
            return Ok(());
        }

        // Create new repository if it doesn't exist
        dao_account.repositories.push(Repository {
            name,
            github_url,
            dao_owner: *ctx.accounts.dao_owner.key,
            status: RepoStatus::Active,
            proposals: vec![],
            balance: reward_balance,
        });

        Ok(())
    }

    pub fn find_repository_by_githuburl(
        ctx: Context<FindRepositoryByGithubUrl>,  // Adjusted to expect full context
        github_url: String
    ) -> Result<Repository> {
        let dao_account = &ctx.accounts.dao_account;
        dao_account.repositories.iter()
            .find(|repo| repo.github_url == github_url)
            .cloned()
            .ok_or(CustomError::RepositoryNotFound.into())
    }
    


    pub fn create_proposal(ctx: Context<CreateProposal>, repo_name: String, title: String, description: String, deadline: i64) -> Result<()> {
        let dao_account = &mut ctx.accounts.dao_account;
        
        // Capture dao_owner first, so we only borrow dao_account immutably
        let dao_owner = dao_account.owner;
        
        // Search through the repositories Vec to find the repository with the matching name
        let repository = dao_account.repositories.iter_mut()
            .find(|repo| repo.name == repo_name) // Find the repository by name
            .ok_or(CustomError::RepositoryNotFound)?;
    
        // Perform logic with the mutable borrow
        require!(repository.status == RepoStatus::Active, CustomError::RepositoryInactive);
        require!(deadline > Clock::get()?.unix_timestamp, CustomError::InvalidDeadline);
        
        // Generate proposal ID without borrowing the dao_account again
        let proposal_id = format!("{}/{}/{}", repository.github_url, dao_owner, Clock::get()?.unix_timestamp);
        
        if repository.proposals.iter().any(|p| p.id == proposal_id) {
            return Err(CustomError::ProposalExists.into());
        }
        
        // Create and push proposal
        let proposal = Proposal {
            dao_owner,
            id: proposal_id,
            title,
            description,
            votes_for: 0,
            votes_against: 0,
            finalized: false,
            deadline,
            voted_by_creator: false,
            voted_by_verifier: false,
            funds_allocated: 0,
        };
        
        repository.proposals.push(proposal);
        Ok(())
    } 

    pub fn vote(ctx: Context<Vote>, repo_name: String, proposal_id: String, vote: bool) -> Result<()> {
        let dao_account = &mut ctx.accounts.dao_account;
        
        // Capture dao_owner and verifier public key first
        let dao_owner = dao_account.owner;
        let app_verifier = app_verifier_address();
        
        // Get the repository mutably
        let repository = dao_account.repositories.iter_mut()
            .find(|repo| repo.name == repo_name)
            .ok_or(CustomError::RepositoryNotFound)?;
        
        // Find the proposal within the repository
        let proposal = repository.proposals.iter_mut()
            .find(|p| p.id == proposal_id)
            .ok_or(CustomError::InvalidProposal)?;
        
        // Check if voting is closed or the proposal is already finalized
        let clock = Clock::get()?;
        require!(clock.unix_timestamp <= proposal.deadline, CustomError::VotingClosed);
        require!(!proposal.finalized, CustomError::AlreadyFinalized);
        
        // Get the public key of the voter
        let voter_pubkey = *ctx.accounts.voter.key;
        
        // Ensure that the vote is cast by either the dao_owner or app_verifier
        require!(
            voter_pubkey == dao_owner || voter_pubkey == app_verifier,
            CustomError::Unauthorized
        );
        
        // Track who has voted
        if voter_pubkey == dao_owner {
            require!(!proposal.voted_by_creator, CustomError::AlreadyVoted); // Prevent double voting
            proposal.voted_by_creator = true;
        } else if voter_pubkey == app_verifier {
            require!(!proposal.voted_by_verifier, CustomError::AlreadyVoted); // Prevent double voting
            proposal.voted_by_verifier = true;
        }
        
        // Increment the vote counts based on the vote
        if vote {
            proposal.votes_for += 1;
        } else {
            proposal.votes_against += 1;
        }
        
        // Finalize the proposal if both parties have voted
        if proposal.voted_by_creator && proposal.voted_by_verifier {
            proposal.finalized = true;
        }
        
        Ok(())
    }
    
    
    pub fn finalize_all_proposals(ctx: Context<FinalizeAllProposals>, repo_name: String) -> Result<()> {
        let dao_account = &mut ctx.accounts.dao_account;
        let clock = Clock::get()?;
        
        // Find the repository by name
        let repository = dao_account.repositories.iter_mut()
            .find(|repo| repo.name == repo_name)
            .ok_or(CustomError::RepositoryNotFound)?;

        require!(repository.status == RepoStatus::Active, CustomError::RepositoryInactive);

        // Get all approved proposals
        let approved_proposals: Vec<&mut Proposal> = repository.proposals.iter_mut()
            .filter(|p| {
                p.voted_by_creator && 
                p.voted_by_verifier && 
                p.votes_for > p.votes_against && 
                !p.finalized && 
                clock.unix_timestamp > p.deadline
            })
            .collect();

        let approved_count = approved_proposals.len() as u64;
        require!(approved_count > 0, CustomError::NoApprovedProposals);

        // Calculate equal share for each approved proposal
        let share_per_proposal = repository.balance
            .checked_div(approved_count)
            .ok_or(CustomError::ArithmeticError)?;

        // Distribute funds to each approved proposal
        for proposal in approved_proposals {
            proposal.finalized = true;
            proposal.funds_allocated = share_per_proposal;
        }

        // Update repository balance and status
        let total_allocated = share_per_proposal * approved_count;
        repository.balance -= total_allocated;
        
        // Set repository to inactive after finalizing all proposals
        repository.status = RepoStatus::Inactive;

        Ok(())
    }
    

    pub fn claim_reward(ctx: Context<ClaimReward>, repo_name: String, proposal_id: String) -> Result<()> {
        let dao_account = &mut ctx.accounts.dao_account;
        let auditor_key = ctx.accounts.auditor.key();
    
        // Locate the repository by name
        let repository = dao_account.repositories.iter_mut()
            .find(|repo| repo.name == repo_name)
            .ok_or(CustomError::RepositoryNotFound)?;
    
        // Find the proposal within the repository by ID
        let proposal = repository.proposals.iter_mut()
            .find(|p| p.id == proposal_id)
            .ok_or(CustomError::InvalidProposal)?;
    
        // Check proposal is finalized, has allocated funds, and verify ownership
        require!(proposal.finalized, CustomError::ProposalNotFinalized);
        require!(proposal.funds_allocated > 0, CustomError::NoFundsToClaim);
        require!(proposal.dao_owner == auditor_key, CustomError::Unauthorized);
    
        // Claim allocated reward
        let reward = proposal.funds_allocated;
        proposal.funds_allocated = 0;  // Mark as claimed
    
        // Ensure DAO has sufficient funds for transfer
        require!(
            **ctx.accounts.dao_account.to_account_info().lamports.borrow() >= reward,
            CustomError::InsufficientFunds
        );
    
        // Perform lamport transfer
        **ctx.accounts.auditor.to_account_info().try_borrow_mut_lamports()? += reward;
        **ctx.accounts.dao_account.to_account_info().try_borrow_mut_lamports()? -= reward;
    
        Ok(())
    }
    
    
}

// --- State Structures ---

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct Proposal {
    pub dao_owner: Pubkey,
    pub id: String,
    pub title: String,
    pub description: String,
    pub votes_for: u64,
    pub votes_against: u64,
    pub finalized: bool,
    pub deadline: i64,
    pub voted_by_creator: bool,
    pub voted_by_verifier: bool,
    pub funds_allocated: u64,
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct Repository {
    pub name: String,
    pub github_url: String,
    pub dao_owner: Pubkey,
    pub status: RepoStatus,
    pub proposals: Vec<Proposal>,
    pub balance: u64,
}

#[account]
pub struct DaoState {
    pub owner: Pubkey,
    pub repositories: Vec<Repository>,
    pub github_username: String,
}

// --- Context Structures ---

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = verifier, 
        space = 8 + // discriminator
        32 + // owner pubkey
        4 + 1000 + // github username (string)
        4 + (150 * (32 + 8 + 8)) // reduced capacity to stay under 10KB
    )]
    pub dao_account: Account<'info, DaoState>,
    #[account(mut)]
    pub verifier: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateRepository<'info> {
    #[account(mut)]
    pub dao_account: Account<'info, DaoState>,
    #[account(mut)]
    pub dao_owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(mut)]
    pub dao_account: Account<'info, DaoState>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub dao_account: Account<'info, DaoState>,
    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeAllProposals<'info> {
    #[account(mut)]
    pub dao_account: Account<'info, DaoState>,
    #[account(mut)]
    pub finalizer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub dao_account: Account<'info, DaoState>,
    #[account(mut)]
    pub auditor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FindRepositoryByGithubUrl<'info> {
    #[account(mut)]
    pub dao_account: Account<'info, DaoState>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum RepoStatus {
    Active,
    Inactive,
}

#[error_code]
pub enum CustomError {
    #[msg("Unauthorized action. Only the APP_VERIFIER_ADDRESS can initialize the DAO.")]
    Unauthorized,
    #[msg("The repository is inactive.")]
    RepositoryInactive,
    #[msg("The repository was not found.")]
    RepositoryNotFound,
    #[msg("The proposal ID is invalid.")]
    InvalidProposal,
    #[msg("The proposal has already been finalized.")]
    AlreadyFinalized,
    #[msg("Voting for this proposal has closed.")]
    VotingClosed,
    #[msg("The provided deadline is invalid.")]
    InvalidDeadline,
    #[msg("No funds available for claiming.")]
    NoFundsToClaim,
    #[msg("Proposal has not been finalized yet.")]
    ProposalNotFinalized,
    #[msg("Insufficient funds in the DAO.")]
    InsufficientFunds,
    #[msg("A proposal with this ID already exists.")]
    ProposalExists,
    #[msg("The user has already voted.")]
    AlreadyVoted,
    #[msg("No proposals were approved by both parties")]
    NoApprovedProposals,
    #[msg("Arithmetic error during calculations")]
    ArithmeticError,
    #[msg("Repository is already active")]
    RepositoryAlreadyActive,
}
