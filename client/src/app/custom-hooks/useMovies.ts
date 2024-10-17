import React, { useState } from 'react'
import { Movie } from '../model/movie';
import { initialMovieFormData } from '../const/const';

export default function useMovies() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [movieFormDetails, setMovieFormDetails] = useState({
        mode: "",
        data: initialMovieFormData
    });
    return { movies, setMovies, movieFormDetails, setMovieFormDetails };
}
