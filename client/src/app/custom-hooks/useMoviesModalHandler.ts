import React, { useContext } from 'react'
import { MoviesContext } from '../context/MoviesContext';
import { Movie } from '../model/movie';
import { formModes, initialMovieFormData } from '../const/const';

var movieFormModal: any;

export default function useMoviesModalHandler() {
    const { movieFormDetails, setMovieFormDetails } = useContext<any>(MoviesContext);

    const showMovieFormModal = () => {
        if (!!!movieFormModal) {
            const { Modal } = require("bootstrap");
            movieFormModal = new Modal("#movieFormModal");
        }
        movieFormModal.show();
    };

    const hideMovieFormModal = () => {
        movieFormModal.hide();
    };

    const loadMoviesEditModalWithFormDetails = (movie: Movie) => {
        setMovieFormDetails({
            mode: formModes.EDIT_MODE,
            data: {
                ...movieFormDetails.data,
                ...movie,
                image: {
                    value: null,
                    base64: movie.link_to_movie_image
                }
            }
        })
        showMovieFormModal();
    }

    const loadMoviesCreateModal = () => {
        setMovieFormDetails({
            mode: formModes.CREATE_MODE,
            data: initialMovieFormData
        })
        showMovieFormModal();
    }
    return { movieFormModal, hideMovieFormModal, loadMoviesEditModalWithFormDetails, loadMoviesCreateModal };
}
