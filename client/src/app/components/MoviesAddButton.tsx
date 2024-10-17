import React from 'react'
import useMoviesModalHandler from '../custom-hooks/useMoviesModalHandler';

export default function MoviesAddButton() {
  const { loadMoviesCreateModal } = useMoviesModalHandler();

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={loadMoviesCreateModal}>
        Add
      </button>
    </>
  )
}
