import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Breadcrumb {
    label: string;
    href?: string;
}

export interface PageHeaderProps {
    title: string;
    breadcrumbs: Breadcrumb[];
    actions?: React.ReactNode;
    id?: string;
}

export function PageHeader({ title, breadcrumbs, actions, id }: PageHeaderProps) {
    return (
        <div id={id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col gap-1">
                <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-j-gray-400 md:text-sm">
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        return (
                            <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                                {index > 0 && <ChevronRight size={14} />}
                                {crumb.href && !isLast ? (
                                    <Link href={crumb.href} className="transition-colors hover:text-j-blue-700">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className={isLast ? "font-semibold text-j-blue-800" : ""}>
                                        {crumb.label}
                                    </span>
                                )}
                            </span>
                        );
                    })}
                </nav>
                <h1 className="text-xl font-extrabold text-j-gray-700 md:text-2xl">{title}</h1>
            </div>

            {actions && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    {actions}
                </div>
            )}
        </div>
    );
}

export default PageHeader;
