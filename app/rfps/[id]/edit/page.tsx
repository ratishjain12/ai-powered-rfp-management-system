import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { RFPEditForm } from "@/components/rfp/rfp-edit-form";

async function getRFP(id: string) {
  const rfp = await prisma.rFP.findUnique({
    where: { id },
  });
  return rfp;
}

export default async function EditRFPPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rfp = await getRFP(id);

  if (!rfp) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit RFP</h1>
      </div>
      <RFPEditForm rfp={rfp} />
    </div>
  );
}
