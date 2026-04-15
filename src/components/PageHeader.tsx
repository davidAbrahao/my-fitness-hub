import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  emoji?: string;
}

export function PageHeader({ title, subtitle, emoji }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pt-4 pb-3"
    >
      <h1 className="text-xl font-extrabold tracking-tight text-foreground">
        {emoji && <span className="mr-2">{emoji}</span>}
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      )}
    </motion.div>
  );
}
