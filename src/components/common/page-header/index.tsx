import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Breadcrumb {
    label: string;
    href?: string;
}

export interface PageHeaderProps {
    title: React.ReactNode;
    breadcrumbs: Breadcrumb[];
    actions?: React.ReactNode;
    id?: string;
}

export function PageHeader({ title, breadcrumbs, actions, id }: PageHeaderProps) {
    return (
        <div id={id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col gap-1">
                <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-secondary md:text-sm">
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        return (
                            <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
                                {index > 0 && <ChevronRight size={14} aria-hidden="true" />}
                                {crumb.href && !isLast ? (
                                    <Link href={crumb.href} className="cursor-pointer rounded-sm text-secondary transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-input-border-focus">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span aria-current={isLast ? "page" : undefined} className={isLast ? "font-semibold text-primary" : ""}>
                                        {crumb.label}
                                    </span>
                                )}
                            </span>
                        );
                    })}
                </nav>
                <h1 className="text-xl font-extrabold text-primary md:text-2xl">{title}</h1>
            </div>

            {actions && (
                <div className="flex w-full items-center gap-2 sm:w-auto sm:self-auto">
                    {actions}
                </div>
            )}
        </div>
    );
}

export default PageHeader;
