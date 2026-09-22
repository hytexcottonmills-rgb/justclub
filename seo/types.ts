export interface FAQItem {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface PageMeta {
  slug: string;
  title: string;
  description: string;
  canonical: string;
  h1: string;
  category?: string;
  jsonLd: any[];
  contentHtml: string;
}
