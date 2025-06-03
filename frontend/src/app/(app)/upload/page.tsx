"use client";

import { CreateForm } from "./_components/upload-form";

export default function CreatePage() {
  return (
    <div className="container mx-auto max-w-2xl pb-12">
      <h1 className="mb-3 font-bold text-3xl">Launch Investment Campaign</h1>
      <p className="mb-8 text-muted-foreground">
        Launch a new campaign for your believers to support and collect
      </p>

      <CreateForm />
    </div>
  );
}
