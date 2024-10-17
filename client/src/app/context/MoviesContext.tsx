import React, { ReactNode, useState } from "react";
import { initialMovieFormData } from "../const/const";
import { Movie } from "../model/movie";

export const MoviesContext = React.createContext({});
export const MoviesContextProvider = ({ children } : {children: ReactNode} ) => {
    const [movies, setMovies] = useState<Movie[]>([]);
  /* context api */ const [movieFormDetails, setMovieFormDetails] = useState({
    mode: "",
    data: initialMovieFormData
  });

    return (
        <MoviesContext.Provider value={{ movies, setMovies, movieFormDetails, setMovieFormDetails }}>
            {children}
        </MoviesContext.Provider>
    );
};
