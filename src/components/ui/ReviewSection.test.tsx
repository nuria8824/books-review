import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReviewSection from "./ReviewSection";
import type { Review } from "../../lib/types";

// Mock storage
import * as storage from "../../lib/storage";

const BOOK_ID = "book-123";

const makeReview = (id: string, votes: number, createdAt: number): Review => ({
  id,
  bookId: BOOK_ID,
  stars: 5,
  text: `Reseña ${id}`,
  votes,
  createdAt,
});

describe("ReviewSection", () => {
  beforeEach(() => {
    vi.spyOn(storage, "getReviews").mockImplementation(() => []);
    vi.spyOn(storage, "addReview").mockImplementation(() => {});
    vi.spyOn(storage, "voteReview").mockImplementation(() => {});
  });

  it("should show message when there are no reviews", () => {
    render(<ReviewSection bookId={BOOK_ID} />);
    expect(screen.getByText(/Sé la primera persona en opinar/)).toBeInTheDocument();
  });

  it("should render reviews sorted by votes (desc)", () => {
    vi.spyOn(storage, "getReviews").mockReturnValue([
      makeReview("r1", 2, 1000),
      makeReview("r2", 5, 2000),
      makeReview("r3", 1, 3000),
    ]);

    render(<ReviewSection bookId={BOOK_ID} />);
    const items = screen.getAllByText(/Reseña/);
    expect(items.map(el => el.textContent)).toEqual([
      "Reseña r2",
      "Reseña r1",
      "Reseña r3",
    ]);
  });

  it("should order by createdAt when votes tie", () => {
    vi.spyOn(storage, "getReviews").mockReturnValue([
      makeReview("r1", 2, 1000),
      makeReview("r2", 2, 3000), // más reciente
      makeReview("r3", 2, 2000),
    ]);

    render(<ReviewSection bookId={BOOK_ID} />);
    const items = screen.getAllByText(/Reseña/);
    expect(items.map(el => el.textContent)).toEqual([
      "Reseña r2", // más nuevo
      "Reseña r3",
      "Reseña r1",
    ]);
  });

  it("should call voteReview and re-fetch when voting", () => {
    const mockVote = vi.spyOn(storage, "voteReview");
    const mockGet = vi.spyOn(storage, "getReviews")
      .mockReturnValue([makeReview("r1", 0, 1000)]);

    render(<ReviewSection bookId={BOOK_ID} />);
    fireEvent.click(screen.getByText("👍"));

    expect(mockVote).toHaveBeenCalledWith(BOOK_ID, "r1", 1);
    expect(mockGet).toHaveBeenCalledTimes(2); // initial + after vote
  });
});
