import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function ApplyAuditModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Apply for Audit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply for Audit</DialogTitle>
          <DialogDescription>
            Submit your application to audit this repository. Provide details about your expertise and approach.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="experience" className="text-right">
              Experience
            </Label>
            <Input id="experience" className="col-span-3" placeholder="Years of experience" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expertise" className="text-right">
              Expertise
            </Label>
            <Input id="expertise" className="col-span-3" placeholder="e.g., DeFi, NFT, DAO" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="approach" className="text-right">
              Audit Approach
            </Label>
            <Textarea id="approach" className="col-span-3" placeholder="Describe your audit methodology" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="timeline" className="text-right">
              Estimated Timeline
            </Label>
            <Input id="timeline" className="col-span-3" placeholder="e.g., 2 weeks" />
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" onClick={() => setOpen(false)}>Submit Application</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}