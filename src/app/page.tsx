import { SearchForm } from "@/components/ui/SearchForm";

export default function HomePage() {
  return (
   <section className="space-y-6 py-10">
      <h1 className="text-3xl font-bold">Descubrí libros</h1>
      <SearchForm />
    </section>
  );
}