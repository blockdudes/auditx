'use client'

import { motion } from "framer-motion";
import { useEffect, useState } from "react"; // Import useState for filter management
import RepoCard from "@/components/body/RepoCard"; // Assuming RepoCard is a separate component
import { Button } from "@/components/ui/button";
import { Search, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSession } from "next-auth/react";
import Connect from "@/components/Connect";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getAllRepos } from "@/lib/features/reposSlice";
import { useWallet } from "@solana/wallet-adapter-react";
import RepoProposalModal from "@/components/body/RepoProposalModal";

export default function HomeRepoPage() {
  const session = useSession();
  const wallet = useWallet();
  const dispatch = useAppDispatch();

  // Fetching repos from the Redux state
  const { repos, loading, error } = useAppSelector((state) => state.repos);

  // Fetch data when wallet is available
  useEffect(() => {
    if (wallet) {
      dispatch(getAllRepos(wallet));
    }
  }, [wallet]);

  console.log('repos', repos); // Log the dynamic data

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  // State for filters
  const [auditStatus, setAuditStatus] = useState({
    active: true,
    inactive: false
  });

  const [rewardRange, setRewardRange] = useState("all");
  const [minReward, setMinReward] = useState(1000);
  const [maxReward, setMaxReward] = useState(5000);

  // Function to reset filters
  const resetFilters = () => {
    setAuditStatus({ active: true, inactive: false }); // Reset to default filter values
    setRewardRange("all");
    setMinReward(1000);
    setMaxReward(5000);
  };

  // Add search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);

  // Add repoFilter state
  const [repoFilter, setRepoFilter] = useState({
    allRepos: true,
    myRepos: false
  });

  // Update the filteredRepositories to include search
  const filteredRepositories = repos.filter((repo: any) => {
    // Log the raw repository data
    console.log("Processing repository:", repo);

    // Convert balance from BN to number
    const balance = repo.balance.toNumber();

    // Check repository ownership
    const isMyRepo = wallet?.publicKey && 
      repo.owner.toString() === wallet.publicKey.toString();

    // Check if repository matches the ownership filter
    const matchesOwnership = 
      (repoFilter.allRepos) || 
      (repoFilter.myRepos && isMyRepo);

    // Check if repository matches search query
    const matchesSearch = searchQuery === "" ||
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Check the audit status filter
    const matchesAuditStatus =
      (auditStatus.active && repo.status?.active) ||
      (auditStatus.inactive && repo.status?.inactive);

    // Check the reward range filter
    const matchesRewardRange = () => {
      if (rewardRange === "custom") {
        const isInRange = balance >= minReward && balance <= maxReward;
        console.log(`Custom Range (${minReward}-${maxReward}):`, isInRange);
        return isInRange;
      }
      if (rewardRange === "under1000") {
        const isUnder1000 = balance < 1000;
        console.log("Under 1000:", isUnder1000);
        return isUnder1000;
      }
      if (rewardRange === "1000-5000") {
        const isBetween1000And5000 = balance >= 1000 && balance <= 5000;
        console.log("Between 1000 and 5000:", isBetween1000And5000);
        return isBetween1000And5000;
      }
      if (rewardRange === "5000-10000") {
        const isBetween5000And10000 = balance > 5000 && balance <= 10000;
        console.log("Between 5000 and 10000:", isBetween5000And10000);
        return isBetween5000And10000;
      }
      return true;
    };

    const rewardRangeMatch = matchesRewardRange();
    console.log("Reward Range Match:", rewardRangeMatch);

    // Include search in final match criteria
    return matchesSearch && matchesAuditStatus && rewardRangeMatch && matchesOwnership;
  });

  const handleRepoClick = (repo: any) => {
    const newRepo = {...repo, rewardOwnerCount: repo.proposals.filter((proposal: any) => Number(proposal.votesFor.toString().replace(/"/g, '')) == 2).length};
    setSelectedRepo(newRepo);
    setIsModalOpen(true);
  };


  return (
    <motion.div className="container py-8" {...fadeIn}>
      {/* Hero Section */}
      <motion.div className="max-w-2xl mb-8" {...fadeIn}>
        <h1 className="text-4xl font-bold mb-2">Secure Your Smart Contracts</h1>
        <p className="text-muted-foreground text-lg">
          Browse repositories, audit contracts, and earn rewards through decentralized voting.
        </p>
      </motion.div>


      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Filter Sidebar Section */}
        <motion.aside {...fadeIn} transition={{ delay: 0.2 }}>
          <div className="space-y-6 sticky top-24">
            <div>
              <h3 className="font-semibold mb-4 flex justify-between items-center">
                Filter Repositories
                <Button variant="link" className="text-red-500 h-auto p-0" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </h3>

              {/* Filter Sections */}
              <div className="space-y-4">
                {/* Audit Status Filter */}
                <FilterSection title="Audit Status">
                  <FilterCheckbox
                    id="active"
                    label="Active"
                    checked={auditStatus.active}
                    onChange={() => setAuditStatus((prev) => ({ ...prev, active: !prev.active }))}
                  />

                  <FilterCheckbox
                    id="inactive"
                    label="Inactive"
                    checked={auditStatus.inactive}
                    onChange={() => setAuditStatus((prev) => ({ ...prev, inactive: !prev.inactive }))}
                  />
                </FilterSection>

                {/* Reward Range Filter */}
                <FilterSection title="Reward Range">
                  <RadioGroup value={rewardRange} onValueChange={setRewardRange}>
                    <FilterRadio value="all" label="All" />
                    <FilterRadio value="under1000" label="Under 1000 USDC" />
                    <FilterRadio value="1000-5000" label="1000-5000 USDC" />
                    <FilterRadio value="5000-10000" label="5000-10000 USDC" />
                    <FilterRadio value="custom" label="Custom" />
                  </RadioGroup>
                  {rewardRange === "custom" && (
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        value={minReward}
                        onChange={(e) => setMinReward(Number(e.target.value))}
                        placeholder="1,000"
                        className="w-24"
                      />
                      <span>to</span>
                      <Input
                        type="number"
                        value={maxReward}
                        onChange={(e) => setMaxReward(Number(e.target.value))}
                        placeholder="5,000"
                        className="w-24"
                      />
                    </div>
                  )}
                </FilterSection>

                <FilterSection title="Repository Filter">
                  <FilterCheckbox
                    id="all_repos"
                    label="All Repositories"
                    checked={repoFilter.allRepos}
                    onChange={() => setRepoFilter({
                      allRepos: !repoFilter.allRepos,
                      myRepos: false
                    })}
                  />
                  <FilterCheckbox
                    id="my_repos"
                    label="My Repositories"
                    checked={repoFilter.myRepos}
                    onChange={() => setRepoFilter({
                      allRepos: false,
                      myRepos: !repoFilter.myRepos
                    })}
                  />
                </FilterSection>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content Section */}
        <motion.div className="space-y-6" {...fadeIn} transition={{ delay: 0.4 }}>
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search repositories or keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setSearchQuery("")} // Optional: Add clear search functionality
            >
              Find Repositories
            </Button>
          </div>

          {/* Repository Cards Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">{filteredRepositories.length} Repositories Available for Audit</h2>
            <div className="space-y-4">
              {filteredRepositories.length > 0 ? (
                filteredRepositories.map((repo: any, index: number) => {
                  // Ensure daoOwner is a string
                  const daoOwnerString = repo.daoOwner ? repo.daoOwner.toString() : "Unknown";

                  // Ensure balance is a string or number
                  const balance = repo.balance.toNumber();
                  // Ensure status is a valid string
                  const statusString = repo.status?.active ? "Active" : "Inactive";

                  // Log converted values
                  console.log("Converted daoOwnerString:", daoOwnerString);
                  console.log('balance', balance)

                  return (
                    <RepoCard
                      key={index}
                      logo={`https://avatar.iran.liara.run/username?username=${repo.name}`}
                      name={repo.name}
                      owner={daoOwnerString}  // This should be a string now
                      client={repo.owner} 
                      status={statusString}   // This should be a string now
                      reward={`${balance / 10 ** 9} SOL`} // This should be a string now
                      postedTime={repo.postedTime.toString()}
                      description={repo.description}
                      repoUrl={`https://github.com/${repo.githubUrl}`}
                      onClick={() => handleRepoClick(repo)}  // Add this line
                      isOwner={wallet?.publicKey && repo.owner.toString() === wallet.publicKey.toString() || false}
                    />
                  );
                })
              ) : (
                <p>No repositories match your filters.</p>
              )}
            </div>
            <RepoProposalModal repo={selectedRepo} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
}

// Filter Section Component
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block font-medium">{title}</Label>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// Filter Checkbox Component
function FilterCheckbox({ id, label, checked = false, onChange }: { id: string; label: string; checked: boolean, onChange: () => void }) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="text-sm">{label}</Label>
    </div>
  );
}

// Filter Radio Component
function FilterRadio({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={value} id={value} className="text-sm" />
      <Label htmlFor={value} className="text-sm">{label}</Label>
    </div>
  );
}
