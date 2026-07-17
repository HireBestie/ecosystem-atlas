import { AtlasApp } from "@/components/atlas/atlas-app";
import type { AtlasData } from "@/lib/atlas-types";
import atlasJson from "@/data/atlas.json";

export default function Home() {
  const data = atlasJson as AtlasData;
  return <AtlasApp data={data} />;
}
