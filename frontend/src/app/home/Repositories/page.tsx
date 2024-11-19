'use client'

import { motion } from "framer-motion";
import { useState } from "react"; // Import useState for filter management
import RepoCard from "@/components/body/RepoCard"; // Assuming RepoCard is a separate component
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSession } from "next-auth/react";
import Connect from "@/components/Connect";

// Example repository data for filtering
const repositoryData = [
  { name: "DeFi Lending Protocol", owner: "DecentraLend", status: "Pending", reward: 5000, contractType: "DeFi", postedTime: "2 hours ago", description: "A decentralized lending protocol built on Ethereum." },
  { name: "NFT Marketplace Smart Contracts", owner: "CryptoArtExchange", status: "In Progress", reward: 3500, contractType: "NFT", postedTime: "1 day ago", description: "Smart contracts for a new NFT marketplace." },
  { name: "Governance Token and Voting System", owner: "DecentralizedOrg", status: "Completed", reward: 4000, contractType: "DAO", postedTime: "3 days ago", description: "DAO governance token and on-chain voting system." }
];

export default function HomeRepoPage() {
  const session = useSession();

  console.log(session);
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  // State for filters
  const [auditStatus, setAuditStatus] = useState({
    pending: true,
    inProgress: false,
    completed: false
  });
  const [rewardRange, setRewardRange] = useState("custom");
  const [minReward, setMinReward] = useState(1000);
  const [maxReward, setMaxReward] = useState(5000);

  // Function to reset filters
  const resetFilters = () => {
    setAuditStatus({ pending: true, inProgress: false, completed: false });
    setRewardRange("custom");
    setMinReward(1000);
    setMaxReward(5000);
  };

  // Filter repositories based on the selected filters
  const filteredRepositories = repositoryData.filter((repo) => {
    // Audit Status Filtering
    const matchesAuditStatus = (auditStatus.pending && repo.status === "Pending") ||
      (auditStatus.inProgress && repo.status === "In Progress") ||
      (auditStatus.completed && repo.status === "Completed");

    // Reward Range Filtering: Check if the reward is within the selected range
    const matchesRewardRange = () => {
      if (rewardRange === "custom") {
        return repo.reward >= minReward && repo.reward <= maxReward;
      }
      if (rewardRange === "under1000") {
        return repo.reward < 1000;
      }
      if (rewardRange === "1000-5000") {
        return repo.reward >= 1000 && repo.reward <= 5000;
      }
      if (rewardRange === "5000-10000") {
        return repo.reward > 5000 && repo.reward <= 10000;
      }
      return true;
    };

    // Return only repositories that match both conditions
    return matchesAuditStatus && matchesRewardRange();
  });

  // Log filtered repositories for debugging
  console.log("Filtered Repositories: ", filteredRepositories);



  return (
    <motion.div className="container py-8" {...fadeIn}>
      {/* Hero Section */}
      <motion.div className="max-w-2xl mb-8" {...fadeIn}>
        <h1 className="text-4xl font-bold mb-2">Secure Your Smart Contracts</h1>
        <p className="text-muted-foreground text-lg">
          Browse repositories, audit contracts, and earn rewards through decentralized voting.
        </p>
      </motion.div>

      <Connect />

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
                    id="pending"
                    label="Pending"
                    defaultChecked={auditStatus.pending}
                    onChange={() => setAuditStatus({ ...auditStatus, pending: !auditStatus.pending })}
                  />
                  <FilterCheckbox
                    id="in-progress"
                    label="In Progress"
                    defaultChecked={auditStatus.inProgress}
                    onChange={() => setAuditStatus({ ...auditStatus, inProgress: !auditStatus.inProgress })}
                  />
                  <FilterCheckbox
                    id="completed"
                    label="Completed"
                    defaultChecked={auditStatus.completed}
                    onChange={() => setAuditStatus({ ...auditStatus, completed: !auditStatus.completed })}
                  />
                </FilterSection>

                {/* Reward Range Filter */}
                <FilterSection title="Reward Range">
                  <RadioGroup value={rewardRange} onValueChange={setRewardRange}>
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
              <Input className="pl-9" placeholder="Search repositories or keywords" />
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">Find Repositories</Button>
          </div>

          {/* Repository Cards Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">{filteredRepositories.length} Repositories Available for Audit</h2>
            <div className="space-y-4">
              {filteredRepositories.length > 0 ? (
                filteredRepositories.map((repo, index) => (
                  <RepoCard
                    key={index}
                    logo="/placeholder.svg?height=40&width=40"
                    name={repo.name}
                    owner={repo.owner}
                    status={repo.status}
                    reward={`${repo.reward} USDC`}
                    postedTime={repo.postedTime}
                    description={repo.description}
                    repoUrl="#"
                  />
                ))
              ) : (
                <p>No repositories match your filters.</p>
              )}
            </div>
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
function FilterCheckbox({ id, label, defaultChecked = false, onChange }: { id: string; label: string; defaultChecked?: boolean, onChange: () => void }) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} defaultChecked={defaultChecked} onCheckedChange={onChange} />
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </label>
    </div>
  );
}

// Filter Radio Component
function FilterRadio({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={value} id={value} />
      <Label htmlFor={value} className="text-sm text-muted-foreground">
        {label}
      </Label>
    </div>
  );
}
