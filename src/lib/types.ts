export type Volume = {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: { smallThumbnail?: string; thumbnail?: string; medium?: string; large?: string };
    categories?: string[];
    publishedDate?: string;
    pageCount?: number;
    publisher?: string;
    industryIdentifiers?: { type: string; identifier: string }[];
  };
};

export type Review = {
  id: string;        // uuid
  bookId: string;    // volume id
  stars: 1|2|3|4|5;
  text: string;
  votes: number;     // up - down
  createdAt: number; // timestamp
};