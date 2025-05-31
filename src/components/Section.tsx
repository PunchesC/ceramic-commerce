import { ReactNode } from 'react';


interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default Section;
