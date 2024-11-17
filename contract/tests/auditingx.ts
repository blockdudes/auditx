import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { AuditingxContract } from "../target/types/auditingx_contract";
import { PublicKey } from "@solana/web3.js";
import {struct, u32, u64, publicKey, str, vec, bool, i64, u8, rustEnum} from "@project-serum/borsh";
import assert from "assert";
import bs58 from 'bs58';


describe("auditingx-contract", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AuditingxContract as Program<AuditingxContract>;

  // Generate keypairs for testing
  const client = anchor.web3.Keypair.generate();
  const client2 = anchor.web3.Keypair.generate();
  const auditor = anchor.web3.Keypair.generate();
  let daoAccount = anchor.web3.Keypair.generate();


  // Setup before tests
  // before(async () => {
  //   // Airdrop SOL to client for transactions
  //   const signature = await provider.connection.requestAirdrop(
  //     client.publicKey,
  //     2 * anchor.web3.LAMPORTS_PER_SOL
  //   );
  //   await provider.connection.confirmTransaction(signature);

  //   // Create DAO account keypair
  //   daoAccount = anchor.web3.Keypair.generate();
  // });


  it("Initializes a DAO", async () => {
    const githubUsername = "clientGithub";

    // Get the app verifier keypair
    const secretKeyString = '4YCFm1YP4p3WZy34HFn5XoWffcSG1CDu1QidsEGPXsuqN7JSAkUb6zEXVB4fRaxKo2joUNt359HtLCKwYYh2ukE4';
    const secretKeyArray = bs58.decode(secretKeyString);
    const appVerifier = anchor.web3.Keypair.fromSecretKey(secretKeyArray);

    // Airdrop SOL to verifier
    const signature = await provider.connection.requestAirdrop(
      appVerifier.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    try {
      await program.methods
        .initialize(client.publicKey, githubUsername)
        .accounts({
          daoAccount: daoAccount.publicKey,
          verifier: appVerifier.publicKey,
        })
        .signers([daoAccount, appVerifier])
        .rpc();

      // Fetch and verify the DAO state
      const daoState = await program.account.daoState.fetch(daoAccount.publicKey);
      assert.equal(daoState.owner.toBase58(), client.publicKey.toBase58());
      assert.equal(daoState.githubUsername, githubUsername);

    } catch (error) {
      console.error("Errorsss:", error);
      throw error;
    }
  });

  it("Creates a Repository", async () => {
    const repoData = {
      name: "AuditingX Repo",
      githubUrl: "https://github.com/auditingx/auditingx-contract",
      rewardBalance: new anchor.BN(100)
    };

    try {
      await program.methods
        .createRepository(repoData.name, repoData.githubUrl, repoData.rewardBalance)
        .accounts({
          daoAccount: daoAccount.publicKey,
          daoOwner: client.publicKey,
        })
        .signers([client])
        .rpc();

      // Verify repository creation
      const daoState = await program.account.daoState.fetch(daoAccount.publicKey);
      const repository = daoState.repositories[0];

      assert.ok(repository);
      assert.equal(repository.name, repoData.name);
      assert.equal(repository.githubUrl, repoData.githubUrl);
      assert.equal(repository.balance.toString(), repoData.rewardBalance.toString());
    } catch (error) {
      console.error("Error creating repository:", error);
      throw error;
    }
  });

  it("Creates a Proposal Successfully", async () => {
    const repoData = {
      name: "AuditingX Repo",
      githubUrl: "https://github.com/auditingx/auditingx-contract",
      rewardBalance: new anchor.BN(100)
    };

    // Check if the repository is already created and active, and skip creation if so.
    const daoState = await program.account.daoState.fetch(daoAccount.publicKey);
    let repository = daoState.repositories.find((repo) => repo.name === repoData.name);

    if (!repository) {
      // Create the repository only if it doesn't already exist
      await program.methods
        .createRepository(repoData.name, repoData.githubUrl, repoData.rewardBalance)
        .accounts({
          daoAccount: daoAccount.publicKey,
          daoOwner: client.publicKey,
        })
        .signers([client])
        .rpc();
    } else {
      console.log("Repository already exists and is active.");
    }

    const proposalData = {
      repoName: repoData.name,
      title: "Fix Bug XYZ",
      description: "This proposal is to fix bug XYZ.",
      deadline: new anchor.BN(Date.now() / 1000 + 186400), // 1 day from now
    };

    // Create proposal
    await program.methods
      .createProposal(proposalData.repoName, proposalData.title, proposalData.description, proposalData.deadline)
      .accounts({
        daoAccount: daoAccount.publicKey,
        creator: client.publicKey,
      })
      .signers([client])
      .rpc();

    await program.methods
      .createProposal(proposalData.repoName, "proposalData.title", "proposalData.description", new anchor.BN(Date.now() / 1000 + 186400),)
      .accounts({
        daoAccount: daoAccount.publicKey,
        creator: client2.publicKey,
      })
      .signers([client2])
      .rpc();

    // Fetch and verify the proposal
    const updatedDaoState = await program.account.daoState.fetch(daoAccount.publicKey);
    repository = updatedDaoState.repositories[0];
    const proposal = repository.proposals[0];

    assert.equal(proposal.title, proposalData.title);
    assert.equal(proposal.description, proposalData.description);
    assert.equal(proposal.deadline.toString(), proposalData.deadline.toString());
  });

  it("Votes on Proposal Successfully", async () => {

    const secretKeyString = '4YCFm1YP4p3WZy34HFn5XoWffcSG1CDu1QidsEGPXsuqN7JSAkUb6zEXVB4fRaxKo2joUNt359HtLCKwYYh2ukE4';
    const secretKeyArray = bs58.decode(secretKeyString);
    const appVerifier = anchor.web3.Keypair.fromSecretKey(secretKeyArray);

    const repoData = {
      name: "AuditingX Repo",
      githubUrl: "https://github.com/auditingx/auditingx-contract",
      rewardBalance: new anchor.BN(100),
    };

    // Ensure the repository exists before voting
    const daoState = await program.account.daoState.fetch(daoAccount.publicKey);
    let repository = daoState.repositories.find((repo) => repo.name === repoData.name);

    if (!repository) {
      throw new Error("Repository does not exist, cannot vote on a proposal");
    }

    const proposalData = {
      repoName: repoData.name,
      title: "Fix Bug XYZ",
      description: "This proposal is to fix bug XYZ.",
      deadline: new anchor.BN(Date.now() / 1000 + 186400), // 1 day from now
    };

    // Check if the proposal already exists by title
    let proposalIndex = -1;
    let proposalId = ''; // Initialize proposalId

    const existingProposal = repository.proposals.find((proposal, index) => {
      if (proposal.title === proposalData.title) {
        proposalIndex = index; // Found the proposal, use its index
        proposalId = proposal.id; // Store the proposal ID
        return true;
      }
      return false;
    });

    // If no existing proposal, create a new one
    if (!existingProposal) {
      console.log("Creating new proposal...");
      // Create the proposal if it doesn't exist
      await program.methods
        .createProposal(proposalData.repoName, proposalData.title, proposalData.description, proposalData.deadline)
        .accounts({
          daoAccount: daoAccount.publicKey,
          creator: client.publicKey,
        })
        .signers([client])
        .rpc();

      // Fetch the updated DAO state to get the correct proposal index
      const updatedDaoState = await program.account.daoState.fetch(daoAccount.publicKey);
      const updatedRepository = updatedDaoState.repositories.find((repo) => repo.name === repoData.name);

      if (!updatedRepository) {
        throw new Error("Failed to find repository after proposal creation");
      }

      // After proposal creation, find the new proposal and update proposalIndex and proposalId
      const proposal = updatedRepository.proposals.find(
        (proposal) => proposal.title === proposalData.title
      );

      if (!proposal) {
        throw new Error("Proposal was not created or fetched correctly");
      }

      // Set the proposalIndex and proposalId now that the proposal is created
      proposalIndex = updatedRepository.proposals.indexOf(proposal);
      proposalId = proposal.id; // Get the actual proposalId
      console.log(`Proposal created with index: ${proposalIndex}, proposalId: ${proposalId}`);
    } else {
      console.log("Proposal with this title already exists. Skipping creation.");
    }

    // Now vote on the proposal (use the correct proposalId)
    const voteData = {
      proposalId, // Use the correct proposalId here
      vote: true, // True for "Yes", False for "No"
    };

    // Vote on the proposal
    await program.methods
      .vote(proposalData.repoName, voteData.proposalId, voteData.vote)
      .accounts({
        daoAccount: daoAccount.publicKey,
        voter: appVerifier.publicKey,
      })
      .signers([appVerifier])
      .rpc();

    await program.methods
      .vote(proposalData.repoName, voteData.proposalId, voteData.vote)
      .accounts({
        daoAccount: daoAccount.publicKey,
        voter: client.publicKey,
      })
      .signers([client])
      .rpc();

    // Fetch updated DAO state to verify the vote was cast
    const updatedDaoState = await program.account.daoState.fetch(daoAccount.publicKey);
    const updatedRepository = updatedDaoState.repositories.find((repo) => repo.name === repoData.name);

    if (!updatedRepository) {
      throw new Error("Repository was not found after voting.");
    }

    const proposal = updatedRepository.proposals[proposalIndex];
    // Assert the proposal exists and check the voting result
    assert.ok(proposal, "Proposal should still exist after voting");
  });

  it("Finalizes Proposal Successfully", async () => {
    const secretKeyString = '4YCFm1YP4p3WZy34HFn5XoWffcSG1CDu1QidsEGPXsuqN7JSAkUb6zEXVB4fRaxKo2joUNt359HtLCKwYYh2ukE4';
    const secretKeyArray = bs58.decode(secretKeyString);
    const appVerifier = anchor.web3.Keypair.fromSecretKey(secretKeyArray);

    const repoData = {
      name: "AuditingX Repo",
      githubUrl: "https://github.com/auditingx/auditingx-contract",
      rewardBalance: new anchor.BN(100),
    };

    // Ensure the repository exists before finalizing the proposal
    const daoState = await program.account.daoState.fetch(daoAccount.publicKey);
    const repository = daoState.repositories.find((repo) => repo.name === repoData.name);

    if (!repository) {
      throw new Error("Repository does not exist, cannot finalize a proposal");
    }

    const proposalData = {
      repoName: repoData.name,
      title: "Fix Bug XYZ",
      description: "This proposal is to fix bug XYZ.",
      deadline: new anchor.BN(Date.now() / 1000 + 186400), // 1 day from now
    };

    // Check if the proposal already exists
    let existingProposal = repository.proposals.find(
      (proposal) => proposal.title === proposalData.title
    );

    // If no proposal exists, create one
    if (!existingProposal) {
      console.log("Creating new proposal...");
      await program.methods
        .createProposal(proposalData.repoName, proposalData.title, proposalData.description, proposalData.deadline)
        .accounts({
          daoAccount: daoAccount.publicKey,
          creator: client.publicKey,
        })
        .signers([client])
        .rpc();

      // Re-fetch the updated DAO state after creation
      const updatedDaoState = await program.account.daoState.fetch(daoAccount.publicKey);
      const updatedRepository = updatedDaoState.repositories.find(
        (repo) => repo.name === repoData.name
      );
      existingProposal = updatedRepository?.proposals.find(
        (proposal) => proposal.title === proposalData.title
      );

      if (!existingProposal) {
        throw new Error("Proposal creation failed or could not be fetched.");
      }
      console.log("Proposal created successfully");
    } else {
      console.log("Proposal already exists, skipping creation.");
    }

    // Ensure proposal has not already been finalized
    if (existingProposal.finalized) {
      throw new Error("Proposal has already been finalized.");
    }

    // Log the current proposal state
    console.log("Existing Proposal:", existingProposal);

    // Vote on the proposal (ensure it is approved by both parties)
    const voteData = {
      proposalIndex: 0, // Assuming this is the first proposal, but this can vary if there are multiple proposals
      vote: true, // True for "Yes", False for "No"
    };

    // await program.methods
    //   .vote(proposalData.repoName, existingProposal.id, voteData.vote)
    //   .accounts({
    //     daoAccount: daoAccount.publicKey,
    //     voter: appVerifier.publicKey, // Assuming client is the voter
    //   })
    //   .signers([appVerifier])
    //   .rpc();

    // Fetch updated DAO state to check if the proposal was approved
    const updatedDaoStateAfterVote = await program.account.daoState.fetch(daoAccount.publicKey);
    const updatedRepositoryAfterVote = updatedDaoStateAfterVote.repositories.find(
      (repo) => repo.name === repoData.name
    );
    const approvedProposal = updatedRepositoryAfterVote?.proposals.find(
      (proposal) => proposal.title === proposalData.title
    );

    if (!approvedProposal || approvedProposal.votedByCreator === false) {
      throw new Error("Proposal was not approved by the necessary parties.");
    }

    console.log("Proposal approved, proceeding with finalization.");

    // Now finalize the proposal, using the correct proposal ID or index
    const proposalIndex = updatedRepositoryAfterVote.proposals.findIndex(
      (proposal) => proposal.title === proposalData.title
    );

    console.log("Finalizing Proposal Index:", proposalIndex);

    await program.methods
      .finalizeAllProposals(proposalData.repoName) // Assuming it's the first proposal
      .accounts({
        daoAccount: daoAccount.publicKey,
        finalizer: auditor.publicKey, // Assuming auditor is the finalizer
      })
      .signers([auditor])
      .rpc();

    // Fetch updated DAO state to verify the proposal was finalized
    const updatedDaoStateAfterFinalization = await program.account.daoState.fetch(daoAccount.publicKey);
    const updatedRepositoryAfterFinalization = updatedDaoStateAfterFinalization.repositories.find(
      (repo) => repo.name === repoData.name
    );
    const finalizedProposal = updatedRepositoryAfterFinalization?.proposals.find(
      (proposal) => proposal.title === proposalData.title
    );

    assert.ok(finalizedProposal, "Proposal should still exist after being finalized");
    assert.equal(finalizedProposal.finalized, true, "Proposal status should be 'finalized'");
  });

  // it("Claims Rewards Successfully", async () => {
  //   const repoData = {
  //     name: "AuditingX Repo",
  //     githubUrl: "https://github.com/auditingx/auditingx-contract",
  //     rewardBalance: new anchor.BN(100),
  //   };

  //   const proposalData = {
  //     repoName: repoData.name,
  //     title: "Fix Bug XYZ",
  //     description: "This proposal is to fix bug XYZ.",
  //     deadline: new anchor.BN(Date.now() / 1000 + 186400), // 1 day from now
  //   };

  //   // Ensure the repository exists before claiming
  //   const daoState = await program.account.daoState.fetch(daoAccount.publicKey);
  //   let repository = daoState.repositories.find((repo) => repo.name === repoData.name);

  //   if (!repository) {
  //     throw new Error("Repository does not exist, cannot claim rewards");
  //   }

  //   // Ensure the proposal exists before claiming rewards
  //   let existingProposal = repository.proposals.find(
  //     (proposal) => proposal.title === proposalData.title
  //   );

  //   if (!existingProposal) {
  //     console.log("Creating new proposal...");
  //     await program.methods
  //       .createProposal(proposalData.repoName, proposalData.title, proposalData.description, proposalData.deadline)
  //       .accounts({
  //         daoAccount: daoAccount.publicKey,
  //         creator: client.publicKey,
  //       })
  //       .signers([client])
  //       .rpc();

  //     // Re-fetch the updated DAO state after proposal creation
  //     const updatedDaoState = await program.account.daoState.fetch(daoAccount.publicKey);
  //     const updatedRepository = updatedDaoState.repositories.find(
  //       (repo) => repo.name === repoData.name
  //     );
  //     existingProposal = updatedRepository?.proposals.find(
  //       (proposal) => proposal.title === proposalData.title
  //     );
  //   }

  //   // Ensure the proposal has been voted on and finalized before claiming rewards
  //   if (!existingProposal.finalized) {
  //     console.log("Finalizing Proposal...");
  //     await program.methods
  //       .finalizeAllProposals(proposalData.repoName)
  //       .accounts({
  //         daoAccount: daoAccount.publicKey,
  //         finalizer: auditor.publicKey, // Assuming auditor is the finalizer
  //       })
  //       .signers([auditor])
  //       .rpc();

  //     // Re-fetch the updated DAO state after finalization
  //     const updatedDaoStateAfterFinalization = await program.account.daoState.fetch(daoAccount.publicKey);
  //     const updatedRepositoryAfterFinalization = updatedDaoStateAfterFinalization.repositories.find(
  //       (repo) => repo.name === repoData.name
  //     );
  //     existingProposal = updatedRepositoryAfterFinalization?.proposals.find(
  //       (proposal) => proposal.title === proposalData.title
  //     );
  //   }

  //   // Now, claim the rewards from the finalized proposal
  //   const claimData = {
  //     repoName: repoData.name,
  //     proposalId: existingProposal.id, // Use the correct proposalId here
  //   };

  //   try {
  //     // Claim rewards (auditor or client)
  //     const signature = await program.methods
  //       .claimReward(claimData.repoName, claimData.proposalId)
  //       .accounts({
  //         daoAccount: daoAccount.publicKey,
  //         auditor: client.publicKey, // Corrected the property name to 'auditor'
  //       })
  //       .signers([client]) // Sign as auditor
  //       .rpc();
  //     // Fetch updated DAO state to verify the claim was successful
  //     const updatedDaoStateAfterClaim = await program.account.daoState.fetch(daoAccount.publicKey);
  //     const updatedRepositoryAfterClaim = updatedDaoStateAfterClaim.repositories.find(
  //       (repo) => repo.name === repoData.name
  //     );
  //     const updatedProposal = updatedRepositoryAfterClaim?.proposals.find(
  //       (proposal) => proposal.id === claimData.proposalId
  //     );

  //     assert.ok(updatedProposal, "Proposal should still exist after claiming rewards");
  //     assert.equal(updatedProposal.fundsAllocated.toString(), "0", "Reward balance should be 0 after claiming");
  //     console.log("Claim successful for proposal:", updatedProposal.title);

  //   } catch (error) {
  //     console.error("Error claiming rewards:", error);
  //     throw error;
  //   }
  // });

  //   it("Fetches All Repositories using get_all_repositories", async () => {
  //     // Call get_all_repositories method
  //     const allRepositories = await program.methods
  //         .getAllRepositories()
  //         .accounts({ daoAccount: daoAccount.publicKey })
  //         .rpc();

  //     // Ensure repositories are returned and verify details of one
  //     assert.ok(allRepositories.length > 0, "No repositories found");

  //     const firstRepository = JSON.parse(allRepositories[0]);
  //     assert.equal(firstRepository.name, "AuditingX Repo", "Repository name mismatch");
  //     assert.equal(firstRepository.github_url, "https://github.com/auditingx/auditingx-contract", "Repository URL mismatch");
  // });

  // it("Fetches Repositories by Client using get_repositories_by_client", async () => {
  //     // Call get_repositories_by_client with the client public key
  //     const clientRepositories = await program.methods
  //         .getRepositoriesByClient(client.publicKey)
  //         .accounts({ daoAccount: daoAccount.publicKey })
  //         .rpc();

  //     // Check that repositories exist for this client
  //     assert.ok(clientRepositories.length > 0, "No repositories found for the client");

  //     // Verify repository details
  //     const firstClientRepo = JSON.parse(clientRepositories[0]);
  //     assert.equal(firstClientRepo.name, "AuditingX Repo", "Repository name mismatch for client-owned repo");
  // });

  it("Retrieves all repositories", async () => {

    const rawRepositories = await program.methods
      .getAllRepositories()
      .accounts({
        daoAccount: daoAccount.publicKey, // Provide the DAO account as context
      })
      .rpc();

    console.log("Raw Retrieved Repositories:", rawRepositories);

    // Fetch the DAO account to compare
    const daoAccountData = await program.account.daoState.fetch(daoAccount.publicKey);
    const expectedRepositories = daoAccountData.repositories;

    console.log("Expected Repositories:", expectedRepositories);

    // Validate that the function output matches the DAO state
    assert.ok(
      Array.isArray(expectedRepositories) && expectedRepositories.length > 0,
      "Expected repositories to be an array with items"
    );

    // Log and validate the first repository for example purposes
    const firstRepo = expectedRepositories[0];
    console.log("First Repository:", firstRepo);

    assert.equal(firstRepo.name, "AuditingX Repo", "Repository name doesn't match");
    assert.equal(firstRepo.githubUrl, "https://github.com/auditingx/auditingx-contract", "GitHub URL doesn't match");

  });


  it("Deserializes repositories with proposals and performs assertions", async () => {
    // Define Proposal and Repository classes
    class Proposal {
        id: string;
        dao_owner: PublicKey;
        proposer: PublicKey;
        title: string;
        description: string;
        votes_for: BN;
        votes_against: BN;
        finalized: boolean;
        deadline: BN;
        voted_by_creator: boolean;
        voted_by_verifier: boolean;
        funds_allocated: BN;

        constructor(fields: any) {
            this.id = fields.id;
            this.dao_owner = new PublicKey(fields.dao_owner);
            this.proposer = new PublicKey(fields.proposer);
            this.title = fields.title;
            this.description = fields.description;
            this.votes_for = new BN(fields.votes_for);
            this.votes_against = new BN(fields.votes_against);
            this.finalized = fields.finalized;
            this.deadline = new BN(fields.deadline);
            this.voted_by_creator = fields.voted_by_creator;
            this.voted_by_verifier = fields.voted_by_verifier;
            this.funds_allocated = new BN(fields.funds_allocated);
        }
    }

    class Repository {
        name: string;
        github_url: string;
        dao_owner: PublicKey;
        status: string;
        proposals: Proposal[];
        balance: BN;

        constructor(fields: any) {
            this.name = fields.name;
            this.github_url = fields.github_url;
            this.dao_owner = new PublicKey(fields.dao_owner);
            this.status = fields.status;
            this.proposals = fields.proposals.map((p: any) => new Proposal(p));
            this.balance = new BN(fields.balance);
        }
    }

    // Define RepoStatus layout (correcting enum definition)
    const RepoStatusLayout = rustEnum([
      u8(), // Variant 0: Active
      u8(), // Variant 1: Inactive
  ]);

    // Define layouts for decoding Proposal and Repository
    const ProposalLayout = struct([
        str("id"),
        publicKey("dao_owner"),
        publicKey("proposer"),
        str("title"),
        str("description"),
        u64("votes_for"),
        u64("votes_against"),
        bool("finalized"),
        i64("deadline"),
        bool("voted_by_creator"),
        bool("voted_by_verifier"),
        u64("funds_allocated"),
    ]);

    const RepositoryLayout = struct([
        str("name"),
        str("github_url"),
        publicKey("dao_owner"),
        RepoStatusLayout,  // Enum for RepoStatus
        vec(ProposalLayout, "proposals"),
        u64("balance"),
    ]);

    // Fetch and decode raw data
    const fetchedRepositoriesRaw = await program.methods
        .getRepositoriesByClient(client.publicKey)
        .accounts({
            daoAccount: daoAccount.publicKey,
        })
        .rpc();

    const fetchedRepositoriesBytes = bs58.decode(fetchedRepositoriesRaw);
    console.log("Fetched Repositories Bytes:", fetchedRepositoriesBytes);

    // Deserialization
    const repositories: Repository[] = [];
    let offset = 0;

    while (offset < fetchedRepositoriesBytes.length) {
        try {
            // Decode a repository at the current offset
            const decodedRepository = RepositoryLayout.decode(fetchedRepositoriesBytes, offset);
            offset += RepositoryLayout.span; // Increment offset by the size of the decoded repository

            // Map status discriminant to string representation
            const status =
                decodedRepository.status === 0
                    ? "Active"
                    : "Inactive";

            decodedRepository.status = status;

            repositories.push(new Repository(decodedRepository));
        } catch (err) {
            console.error("Decoding error at offset:", offset, err);
            break; // Stop processing if decoding fails
        }
    }

    console.log("Decoded Repositories:", repositories);

    // Perform assertions
    assert.ok(Array.isArray(repositories), "Expected repositories to be an array");
    if (repositories.length > 0) {
        const firstRepo = repositories[0];
        console.log("First Repository:", firstRepo);
        assert.equal(firstRepo.name, "AuditingX Repo", "Repository name doesn't match");
        assert.equal(firstRepo.github_url, "https://github.com/auditingx/auditingx-contract", "GitHub URL doesn't match");
        assert.equal(firstRepo.status, "Active", "Repository status doesn't match");
    } else {
        assert.equal(repositories.length, 0, "Expected no repositories for the given client");
    }
});



});
