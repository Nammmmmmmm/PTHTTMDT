import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import Home from "./Pages/Home";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import Header from "./Components/Header";
import { createContext } from "react";
import axios from "axios";
import { useEffect, useState } from "react";

const MyContext = createContext();

function App() {

  const [countryList,setCountryList] = useState([]);
  const [selectedCountry,setselectedCountry] = useState('');

  useEffect(() => {
    getCountry("https://countriesnow.space/api/v0.1/countries/");
  }, []);

  const getCountry = async (url) => {
    try {
      const responsive = await axios.get(url).then((res) => {
        setCountryList(res.data.data);
        console.log(res.data.data);
      });
      
    } catch (error) {
      console.error(error);
    }
  };

  const values = {
    countryList,
    setselectedCountry,
    selectedCountry
  }

  return (
    <BrowserRouter>
    <MyContext.Provider value={values}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      </MyContext.Provider>
    </BrowserRouter>
  );
}

export default App;


export { MyContext };