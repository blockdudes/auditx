import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { AuditingxContract } from "../target/types/auditingx_contract";
import { PublicKey } from "@solana/web3.js";
import {struct, u32, u64, publicKey, str, vec, bool, i64, u8, rustEnum} from "@project-serum/borsh";
import assert from "assert";
import bs58 from 'bs58';


describe('auditingx_contract', () => {
  // Setup
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const secretKeyString = '4YCFm1YP4p3WZy34HFn5XoWffcSG1CDu1QidsEGPXsuqN7JSAkUb6zEXVB4fRaxKo2joUNt359HtLCKwYYh2ukE4';
    const secretKeyArray = bs58.decode(secretKeyString);
    const appVerifier = anchor.web3.Keypair.fromSecretKey(secretKeyArray);


  // Account for DAO owner
  const daoAccount = anchor.web3.Keypair.generate();
  
  // Client accounts for testing
  const client = anchor.web3.Keypair.generate();
  
  // Instantiate the program
  const program = anchor.workspace.AuditingxContract;

  // Set a repository and proposal details for testing
  const repositoryName = "My Awesome Repo";
  const githubUrl = "https://github.com/example/repo";
  const proposalTitle = "Improve Documentation";
  const proposalDescription = "We need to improve the documentation for the project.";
  const proposalDeadline = 1682332800; // A unix timestamp

  it('initializes the DAO correctly', async () => {
    // Create account to store the DAO state

    const signature = await provider.connection.requestAirdrop(
      appVerifier.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    await program.methods
      .initialize()
      .accounts({
        daoAccount: daoAccount.publicKey,
        verifier: appVerifier.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([daoAccount, appVerifier])
      .rpc();

    const account = await program.account.daoState.fetch(daoAccount.publicKey);
    assert.equal(
      account.owner.toString(), 
      appVerifier.publicKey.toString(),
      "DAO owner should match the verifier address"
    ); 
   });

  it('initializes a client correctly', async () => {
    try {
        await program.methods
            .initializeClient(client.publicKey, "client_github_user")
            .accounts({
                daoAccount: daoAccount.publicKey,
                client: client.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([client])
            .rpc();

        const daoAccount_data = await program.account.daoState.fetch(daoAccount.publicKey);
        const clientEntry = daoAccount_data.clients.find(
            c => c.address.toString() === client.publicKey.toString()
        );
        assert.ok(clientEntry, "Client should be registered.");
        assert.equal(clientEntry.state.githubUsername, "client_github_user", "GitHub username should match");
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
  });

  // it('creates a repository successfully', async () => {
  //   await program.rpc.createRepository(repositoryName, githubUrl, new anchor.BN(1000), {
  //     accounts: {
  //       daoAccount: daoOwner.publicKey,  // The DAO account holding the repo
  //       caller: client.publicKey,  // Client creating the repository
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     },
  //     signers: [client],
  //   });

  //   const daoAccount = await program.account.daoState.fetch(daoOwner.publicKey);
  //   const clientEntry = daoAccount.clients.find(c => c.address.toString() === client.publicKey.toString());
  //   const repo = clientEntry.state.repositories.find(r => r.githubUrl === githubUrl);
  //   assert.isDefined(repo, "Repository should be created.");
  //   assert.equal(repo.name, repositoryName, "Repository name should match");
  // });

  // it('creates a proposal', async () => {
  //   await program.rpc.createProposal(client.publicKey, repositoryName, proposalTitle, proposalDescription, new anchor.BN(proposalDeadline), {
  //     accounts: {
  //       daoAccount: daoOwner.publicKey,
  //       creator: client.publicKey,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     },
  //     signers: [client],
  //   });

  //   const daoAccount = await program.account.daoState.fetch(daoOwner.publicKey);
  //   const clientEntry = daoAccount.clients.find(c => c.address.toString() === client.publicKey.toString());
  //   const repo = clientEntry.state.repositories.find(r => r.name === repositoryName);
  //   const proposal = repo.proposals.find(p => p.title === proposalTitle);
  //   assert.isDefined(proposal, "Proposal should be created.");
  //   assert.equal(proposal.title, proposalTitle, "Proposal title should match");
  // });

  // it('votes on a proposal', async () => {
  //   // Simulate voting by either the DAO owner or app verifier (app_verifier_address).
  //   const daoOwnerPubkey = daoOwner.publicKey;
  //   const voteChoice = true; // Voting "For"
    
  //   await program.rpc.vote(repositoryName, "My Awesome Repo/Improve Documentation/1682332800", voteChoice, {
  //     accounts: {
  //       daoAccount: daoOwner.publicKey,
  //       voter: daoOwner.publicKey,  // Can vote as the DAO owner
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     },
  //     signers: [daoOwner],
  //   });

  //   // Verify that the vote was counted
  //   const daoAccount = await program.account.daoState.fetch(daoOwner.publicKey);
  //   const clientEntry = daoAccount.clients.find(c => c.address.toString() === daoOwnerPubkey.toString());
  //   const repo = clientEntry.state.repositories.find(r => r.name === repositoryName);
  //   const proposal = repo.proposals.find(p => p.title === proposalTitle);
  //   assert.isTrue(proposal.votedByCreator, "DAO owner should have voted.");
  //   assert.equal(proposal.votesFor.toNumber(), 1, "Vote count should be incremented.");
  // });

  // it('finalizes proposals and distributes rewards', async () => {
  //   await program.rpc.finalizeAllProposals(repositoryName, {
  //     accounts: {
  //       daoAccount: daoOwner.publicKey,
  //       finalizer: daoOwner.publicKey,  // Finalizer is DAO owner
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     },
  //     signers: [daoOwner],
  //   });

  //   const daoAccount = await program.account.daoState.fetch(daoOwner.publicKey);
  //   const clientEntry = daoAccount.clients.find(c => c.address.toString() === daoOwner.publicKey.toString());
  //   const repo = clientEntry.state.repositories.find(r => r.name === repositoryName);
  //   const proposal = repo.proposals.find(p => p.title === proposalTitle);
  //   assert.isTrue(proposal.finalized, "Proposal should be finalized.");
  // });

  // it('claims rewards', async () => {
  //   await program.rpc.claimReward(repositoryName, "My Awesome Repo/Improve Documentation/1682332800", {
  //     accounts: {
  //       daoAccount: daoOwner.publicKey,
  //       auditor: client.publicKey,  // Claiming reward by the client (auditor)
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     },
  //     signers: [client],
  //   });

  //   // Check if the reward was correctly transferred (this would involve checking the lamport balance)
  //   const auditorBalance = await provider.connection.getAccountInfo(client.publicKey);
  //   assert.isNotNull(auditorBalance, "Auditor's balance should have been updated.");
  // });
});
