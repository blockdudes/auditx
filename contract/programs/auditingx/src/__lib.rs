use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use std::str::FromStr;

pub fn app_verifier_address() -> Pubkey {
    Pubkey::from_str("5cjLQKYMciTuqCxdtpUkH7CsLrp1FY2qe2uEhvfePnFr").unwrap()
}

declare_id!("EbWNJCby4EJp5VXivriYWAmZVg32jHxYqWJuiCjrfo76");

#[program]
pub mod auditingx_contract {
    use super::*;

    // pub fn initialize(ctx: Context<Initialize>, dao_owner: Pubkey) -> Result<()> {
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let dao_account = &mut ctx.accounts.dao_account;
        // dao_account.owner = dao_owner;
        // dao_account.owner = *ctx.accounts.signer.key;
        dao_account.owner = *ctx.accounts.verifier.key;
        dao_account.clients = Vec::new(); // Start with no clients
        Ok(())
    }

    pub fn initialize_client(
        ctx: Context<InitializeClient>,
        client_address: Pubkey,
        github_username: String,
    ) -> Result<()> {
        let dao_account = &mut ctx.accounts.dao_account;
    
        // Check if client is already registered
        require!(
            !dao_account.clients.iter().any(|c| c.address == client_address),
            CustomError::ClientAlreadyRegistered
        );
    
        // Initialize the client's state
        dao_account.clients.push(ClientEntry {
            address: client_address,
            state: ClientState {
                github_username,
                repositories: Vec::new(), // Start with no repositories
            },
        });
        
        Ok(())
    }
    
    
    pub fn create_repository(
        ctx: Context<CreateRepository>,
        name: String,
        github_url: String,
        reward_balance: u64,
    ) -> Result<()> {
        let dao_account = &mut ctx.accounts.dao_account;
        let caller = ctx.accounts.caller.key(); // Get the caller's address (the signer)
    
        // First, access the DAO owner immutably
        let dao_owner = dao_account.owner;
    
        // Ensure the caller is already registered as a client in the DAO
        let client_entry = dao_account.clients
            .iter_mut()
            .find(|c| c.address == caller)
            .ok_or(CustomError::ClientNotFound)?;
        let client_state = &mut client_entry.state;
    
        // Check if the repository already exists for this client
        if client_state
            .repositories
            .iter()
            .any(|repo| repo.github_url == github_url)
        {
            return Err(CustomError::RepositoryAlreadyExists.into());
        }
    
        // Create and add the new repository associated with the caller's address
        client_state.repositories.push(Repository {
            name,
            github_url,
            dao_owner, // Use the previously fetched DAO owner
            status: RepoStatus::Active,
            proposals: vec![],
            balance: reward_balance,
        });
    
        Ok(())
    }
    

    pub fn find_repository_by_githuburl(
        ctx: Context<FindRepositoryByGithubUrl>,
        github_url: String
    ) -> Result<Repository> {
        let dao_account = &ctx.accounts.dao_account;
        
        // Search through all clients' repositories
        for client_entry in dao_account.clients.iter() {
            let client_state = &client_entry.state;
            if let Some(repo) = client_state.repositories
                .iter()
                .find(|repo| repo.github_url == github_url) {
                return Ok(repo.clone());
            }
        }
        Err(CustomError::RepositoryNotFound.into())
    }
    
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        client_address: Pubkey,
        repo_name: String,
        title: String,
        description: String,
        deadline: i64,
    ) -> Result<()> {
        let dao_account = &mut ctx.accounts.dao_account;
        
        // Capture dao_owner first before mutable borrow
        let dao_owner = dao_account.owner;
        
        // Now do the mutable borrow
        let client_entry = dao_account.clients
            .iter_mut()
            .find(|c| c.address == client_address)
            .ok_or(CustomError::ClientNotFound)?;
        let client_state = &mut client_entry.state;
        
        // Find the repository for the client
        let repository = client_state.repositories.iter_mut()
            .find(|repo| repo.name == repo_name)
            .ok_or(CustomError::RepositoryNotFound)?;
        
        // Create the proposal using the previously captured dao_owner
        let proposal = Proposal {
            id: format!("{}/{}/{}", repo_name, title, deadline),
            dao_owner, // Use the captured value here
            proposer: *ctx.accounts.creator.key,
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
    

    pub fn vote(ctx: Context<Vote>,client_address: Pubkey, repo_name: String, proposal_id: String, vote: bool) -> Result<()> {
        let dao_account = &mut ctx.accounts.dao_account;
        
        // Capture dao_owner and app_verifier public keys
        let dao_owner = dao_account.owner;
        let app_verifier = app_verifier_address();
        let voter = *ctx.accounts.voter.key;

        

         // Validate that the voter is either the creator of the repository or the app verifier
         require!(
            voter == client_address || voter == app_verifier,
            CustomError::Unauthorized
        );

        // Get the client state by searching for the client that is trying to vote
        let client_entry = dao_account.clients.iter_mut()
            .find(|c| c.address == client_address)
            .ok_or(CustomError::ClientNotFound)?;
        let client_state = &mut client_entry.state;
    
        // Find the repository where the proposal is stored
        let repository = client_state.repositories.iter_mut()
            .find(|repo| repo.name == repo_name)
            .ok_or(CustomError::RepositoryNotFound)?;
        
        // Find the proposal within the repository
        let proposal = repository.proposals.iter_mut()
            .find(|p| p.id == proposal_id)
            .ok_or(CustomError::InvalidProposal)?;
        
        // Ensure voting is still open and proposal is not finalized
        let clock = Clock::get()?;
        require!(clock.unix_timestamp <= proposal.deadline, CustomError::VotingClosed);
        require!(!proposal.finalized, CustomError::AlreadyFinalized);
    
       
    
        // Track who has voted
        if voter == client_address {
            require!(!proposal.voted_by_creator, CustomError::AlreadyVoted);
            proposal.voted_by_creator = true;
        } else if voter == app_verifier {
            require!(!proposal.voted_by_verifier, CustomError::AlreadyVoted);
            proposal.voted_by_verifier = true;
        }
    
        // Increment vote counts based on the vote
        if vote {
            proposal.votes_for += 1;
        } else {
            proposal.votes_against += 1;
        }
    
        Ok(())
    }
    
    
    pub fn finalize_all_proposals(ctx: Context<FinalizeAllProposals>, client_address: Pubkey, repo_name: String) -> Result<()> {
        let dao_account = &mut ctx.accounts.dao_account;
        let clock = Clock::get()?;

        let caller = *ctx.accounts.client.key;
        require!(caller == app_verifier_address() || caller == client_address, CustomError::Unauthorized);
        
        // Get the client state
        let client_entry = dao_account.clients.iter_mut()
            .find(|c| c.address == client_address)
            .ok_or(CustomError::ClientNotFound)?;
        let client_state = &mut client_entry.state;
    
        // Find the repository by name
        let repository = client_state.repositories.iter_mut()
            .find(|repo| repo.name == repo_name)
            .ok_or(CustomError::RepositoryNotFound)?;
    
        require!(repository.status == RepoStatus::Active, CustomError::RepositoryInactive);
    
        // Get all approved proposals
        let approved_proposals: Vec<&mut Proposal> = repository.proposals.iter_mut()
            .filter(|p| {
                p.voted_by_creator && 
                p.voted_by_verifier && 
                p.votes_for > p.votes_against 
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

    pub fn claim_reward(ctx: Context<ClaimReward>, client_address: Pubkey, repo_name: String, proposal_id: String) -> Result<()> {
        let dao_account = &mut ctx.accounts.dao_account;
        let auditor_key = ctx.accounts.auditor.key();
        
        // Find the client associated with the auditor key (if they are registered as a client)
        let client_entry = dao_account.clients.iter_mut()
            .find(|c| c.address == client_address)
            .ok_or(CustomError::ClientNotFound)?;
        let client_state = &mut client_entry.state;
    
        // Locate the repository by name in the client's repositories
        let repository = client_state.repositories.iter_mut()
            .find(|repo| repo.name == repo_name)
            .ok_or(CustomError::RepositoryNotFound)?;
        
        // Find the proposal within the repository by ID
        let proposal = repository.proposals.iter_mut()
            .find(|p| p.id == proposal_id)
            .ok_or(CustomError::InvalidProposal)?;
    
        msg!("proposer: {:?}", proposal.proposer);
        
        // Check proposal is finalized, has allocated funds, and verify ownership
        require!(proposal.finalized, CustomError::ProposalNotFinalized);
        require!(proposal.funds_allocated > 0, CustomError::NoFundsToClaim);
        require!(proposal.proposer == auditor_key, CustomError::Unauthorized); 
        
        // Claim allocated reward
        let reward = proposal.funds_allocated;
        proposal.funds_allocated = 0;  // Mark as claimed
        
        // Ensure DAO has sufficient funds for transfer
        require!(
            **ctx.accounts.dao_account.to_account_info().lamports.borrow() >= reward,
            CustomError::InsufficientFunds
        );
        
        // Perform lamport transfer
        **ctx.accounts.dao_account.to_account_info().try_borrow_mut_lamports()? -= reward;
        **ctx.accounts.auditor.to_account_info().try_borrow_mut_lamports()? += reward;
    
        Ok(())
    }
    
    
        // Getter function to retrieve all repositories in the DAO
    pub fn get_all_repositories(ctx: Context<GetAllRepositories>) -> Result<Vec<Repository>> {
        let dao_account = &ctx.accounts.dao_account;
        
        // Collect all repositories from all clients
        let all_repositories: Vec<Repository> = dao_account.clients
            .iter()
            .flat_map(|c| c.state.repositories.clone())
            .collect();
        
        msg!("Repositories: {:?}", all_repositories);
        Ok(all_repositories)
    }

    // Getter function to retrieve all repositories owned by a specific client address
    pub fn get_repositories_by_client(
        ctx: Context<GetRepositoriesByClient>,
        client_address: Pubkey,
    ) -> Result<Vec<Repository>> {
        let dao_account = &ctx.accounts.dao_account;

        // Filter repositories by the specified client address
        let client_repositories: Vec<Repository> = dao_account.clients
            .iter()
            .find(|c| c.address == client_address)
            .map(|c| c.state.repositories.clone())
            .unwrap_or_default();

        msg!("Client Repositories: {:?}", client_repositories);
        Ok(client_repositories)
    }

    // Getter function to retrieve all proposals in a specified repository by name
    pub fn get_proposals_in_repository(
        ctx: Context<GetProposalsInRepository>,
        client_address: Pubkey,
        repo_name: String,
    ) -> Result<Vec<Proposal>> {
        let dao_account = &ctx.accounts.dao_account;

        // Find the specified repository by name
        let client_entry = dao_account.clients
            .iter()
            .find(|c| c.address == client_address)
            .ok_or(CustomError::ClientNotFound)?;
        let client_state = &client_entry.state;
        
        let repository = client_state.repositories
            .iter()
            .find(|repo| repo.name == repo_name)
            .ok_or(CustomError::RepositoryNotFound)?;

        // Return the proposals in the specified repository
        Ok(repository.proposals.clone())
    }

}

// --- State Structures ---

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub struct Proposal {
    pub id: String,
    pub dao_owner: Pubkey,
    pub proposer: Pubkey,
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


#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub struct Repository {
    pub name: String,
    pub github_url: String,
    pub dao_owner: Pubkey,
    pub status: RepoStatus,
    pub proposals: Vec<Proposal>,
    pub balance: u64,
}


#[derive(Accounts)]
pub struct CreateRepository<'info> {
    #[account(mut)]
    pub dao_account: Account<'info, DaoState>,
    /// CHECK: This account is used only as a reference for the caller's address
    #[account(signer)]
    pub caller: AccountInfo<'info>,
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
    pub client: Signer<'info>,
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub enum RepoStatus {
    Active,
    Inactive,
}

#[derive(Accounts)]
pub struct GetAllRepositories<'info> {
    #[account(mut)]
    pub dao_account: Account<'info, DaoState>,
}

#[derive(Accounts)]
pub struct GetRepositoriesByClient<'info> {
    #[account(mut)]
    pub dao_account: Account<'info, DaoState>,
}

#[derive(Accounts)]
pub struct GetProposalsInRepository<'info> {
    #[account(mut)]
    pub dao_account: Account<'info, DaoState>,
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub struct ClientState {
    pub github_username: String,
    pub repositories: Vec<Repository>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub struct ClientEntry {
    pub address: Pubkey,
    pub state: ClientState,
}

#[account]
pub struct DaoState {
    pub owner: Pubkey, // The DAO's owner, e.g., an admin or verifier
    pub clients: Vec<ClientEntry>, // Map client address to their state
}

#[derive(Accounts)]
pub struct InitializeClient<'info> {
    #[account(mut)]
    pub dao_account: Account<'info, DaoState>,
    #[account(mut)]
    pub client: Signer<'info>, // The client calling this function
    pub system_program: Program<'info, System>,
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
    #[msg("Client is already registered")]
    ClientAlreadyRegistered,
    #[msg("Client not found")]
    ClientNotFound,
    #[msg("Repository already exists")]
    RepositoryAlreadyExists,
}
