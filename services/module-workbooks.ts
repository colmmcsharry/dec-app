import { File, Paths } from "expo-file-system";

import type { ModuleWorkbookData } from "@/data/module-workbooks";

const MODULE_WORKBOOKS_FILENAME = "module_workbooks.json";

type StoredModuleWorkbooks = Record<string, ModuleWorkbookData>;

function getFile(): File {
  return new File(Paths.document, MODULE_WORKBOOKS_FILENAME);
}

async function getStoredWorkbooks(): Promise<StoredModuleWorkbooks> {
  try {
    const file = getFile();
    if (!file.exists) return {};
    const content = await file.text();
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function saveStoredWorkbooks(data: StoredModuleWorkbooks): Promise<void> {
  try {
    const file = getFile();
    if (!file.exists) {
      file.create();
    }
    file.write(JSON.stringify(data));
  } catch (error) {
    console.log("[ModuleWorkbooks] Error saving:", error);
  }
}

export async function getModuleWorkbook(
  slug: string,
  fallback: ModuleWorkbookData
): Promise<ModuleWorkbookData> {
  const data = await getStoredWorkbooks();
  return data[slug] ?? fallback;
}

export async function saveModuleWorkbook(
  slug: string,
  workbook: ModuleWorkbookData
): Promise<void> {
  const data = await getStoredWorkbooks();
  data[slug] = workbook;
  await saveStoredWorkbooks(data);
}
