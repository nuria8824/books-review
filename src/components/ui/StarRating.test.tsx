import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating } from "@/components/ui/StarRating";
import { vi } from "vitest";

describe("StarRating", () => {
  it("debería renderizar 5 estrellas por defecto", () => {
    render(<StarRating />);
    const starButtons = screen.getAllByRole("button", { name: /estrellas/i });
    expect(starButtons).toHaveLength(5);
  });

  it("debería rellenar la cantidad correcta de estrellas según el valor", () => {
    const { container } = render(<StarRating value={3} />);
    
    // Buscar todas las estrellas con la clase de relleno activa
    const filledStars = container.querySelectorAll(".fill-yellow-400");
    expect(filledStars).toHaveLength(3);
  });

  it("debería llamar a onChange cuando se hace clic en una estrella", () => {
    const handleChange = vi.fn();
    render(<StarRating onChange={handleChange} />);
    
    const thirdStar = screen.getByRole("button", { name: "3 estrellas" });
    fireEvent.click(thirdStar);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(3);
  });
  
  it("no falla si no se pasa onChange", () => {
    render(<StarRating />);
    const firstStar = screen.getByRole("button", { name: "1 estrellas" });
    fireEvent.click(firstStar);
  });

  it("debería rellenar todas las estrellas si value es 5", () => {
    const { container } = render(<StarRating value={5} />);
    const filledStars = container.querySelectorAll(".fill-yellow-400");
    expect(filledStars).toHaveLength(5);
  });

  it("debería cambiar el hover correctamente", () => {
    const { container } = render(<StarRating value={2} />);
    const starButtons = screen.getAllByRole("button", { name: /estrellas/i });

    // Hover sobre la cuarta estrella
    fireEvent.mouseEnter(starButtons[3]);
    let filledStars = container.querySelectorAll(".fill-yellow-400");
    expect(filledStars).toHaveLength(4);

    // Hover fuera de cualquier estrella
    fireEvent.mouseLeave(starButtons[3]);
    filledStars = container.querySelectorAll(".fill-yellow-400");
    expect(filledStars).toHaveLength(2);
  });
});
