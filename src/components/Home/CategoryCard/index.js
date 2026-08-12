import React from 'react';
import Link from '@docusaurus/Link';
import {ArrowRight} from 'lucide-react';

export default function CategoryCard({title, description, to, icon: Icon}) {
  return (
    <Link
      className="group flex min-h-44 flex-col rounded-lg border border-slate-300 bg-white p-5 text-slate-900 shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/8 hover:no-underline"
      to={to}>
      <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="block text-base font-semibold leading-6 text-slate-950">{title}</span>
      <span className="mt-2 block flex-1 text-sm leading-6 text-slate-600">{description}</span>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
        <span>查看文档</span>
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  );
}
