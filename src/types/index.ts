export type AdoptionStatus = "全社導入" | "一部導入" | "導入してない";

export interface Tools {
  Cursor: AdoptionStatus;
  Devin: AdoptionStatus;
  "GitHub Copilot": AdoptionStatus;
  ChatGPT: AdoptionStatus;
  "Claude Code": AdoptionStatus;
}

export interface Company {
  company_name: string;
  tools: Tools;
  source: string;
}

export type ToolName = keyof Tools;

export type SortField = "company_name" | ToolName;
export type SortDirection = "asc" | "desc";