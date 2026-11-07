import { renderPublicationContent } from "@/utils/publications/renderContent";
import styles from "./rich-text.module.css";

export function RichTextContent({ content }: { content: string }) {
    return <div className={`${styles.content} ${styles.readOnly}`}>{renderPublicationContent(content)}</div>;
}