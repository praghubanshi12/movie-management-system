import React, { useContext } from 'react'
import { MoviesContext } from '../context/MoviesContext';
import { SERVER_BASE_URL, formModes } from '../const/const';
import { toast } from 'sonner';

export default function useMoviesApiHandler() {
    const { movieFormDetails } = useContext<any>(MoviesContext);

    const fetchMovies = async (page: number, limit: number = 15) => {
        const response = await fetch(`${SERVER_BASE_URL}/movies.php?page=${page}&limit=${limit}`);
        const result = await response.json();
        if (!response.ok) {
            toast.error(result.message || "Something Went Wrong", { position: 'top-right' });
            return null;
        }
        return result;
    }

    const addOrEditMovie = async () => {
        let formBody = {
            ...movieFormDetails.data,
            image: !!movieFormDetails.data.image?.value ? movieFormDetails.data.image.base64 : null
        }
        const requestOptions = {
            method: movieFormDetails.mode,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formBody)
        };

        let additionalFormChangeUrl = movieFormDetails.mode == formModes.EDIT_MODE ? `/${formBody.id}` : '';
        const response = await fetch(`${SERVER_BASE_URL}/movies.php${additionalFormChangeUrl}`, requestOptions);
        const result = await response.json();
        if (!response.ok) {
            toast.error(result.message || "Something Went Wrong", { position: 'top-right' });
            return null;
        }
        return result;
    }

    const deleteMovie = async (id: number) => {
        const requestOptions = {
            method: 'DELETE',
        };
        const response = await fetch(`${SERVER_BASE_URL}/movies.php/${id}`, requestOptions);
        const result = await response.json();
        if (!response.ok) {
            toast.error(result.message || "Something Went Wrong", { position: 'top-right' });
            return null;
        }
        return result;
    }

    return { fetchMovies, addOrEditMovie, deleteMovie }
}
