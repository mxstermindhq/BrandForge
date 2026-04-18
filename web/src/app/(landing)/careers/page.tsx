import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers | BrandForge",
  description: "Join the BrandForge team",
};

const openings = [
  {
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote",
  },
  {
    title: "AI Product Manager",
    department: "Product",
    location: "Remote",
  },
  {
    title: "Community Manager",
    department: "Growth",
    location: "Remote",
  },
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-headline font-bold text-on-surface mb-4">Careers</h1>
        <p className="text-xl text-on-surface-variant mb-12">
          Build the future of AI-powered professional competition.
        </p>
        
        <div className="space-y-4">
          {openings.map((job, index) => (
            <div key={index} className="surface-card p-6 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-on-surface">{job.title}</h3>
                <p className="text-sm text-on-surface-variant">{job.department} • {job.location}</p>
              </div>
              <button className="btn-secondary text-sm">Apply</button>
            </div>
          ))}
        </div>
        
        <p className="mt-12 text-center text-on-surface-variant">
          Don&apos;t see a match?{" "}
          <a href="mailto:careers@brandforge.ai" className="text-primary hover:underline">
            Send us your resume
          </a>
        </p>
      </div>
    </main>
  );
}
