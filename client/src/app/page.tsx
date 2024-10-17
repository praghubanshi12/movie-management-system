"use client";

import React, { createContext, useState } from 'react';
import { Movie } from "./model/movie";
import MoviesTable from "./components/MoviesTable";
import MoviesAddButton from "./components/MoviesAddButton";
import MoviesFormModal from "./components/modals/MoviesFormModal";
import { MoviesContextProvider } from './context/MoviesContext';

export default function Home() {
  return (
    <div className="container">
      <MoviesContextProvider>
        <MoviesAddButton/>
        <MoviesTable/>
        <MoviesFormModal/>
      </MoviesContextProvider>
    </div >
  );
}
