import { use, useRef, useState } from "react";
import { FaMinusCircle, FaPlusCircle  } from "react-icons/fa";
import Button from "@mui/material/Button";

const QuantityBox = () => {
    const [inputVal, setInputVal] = useState(1);

    const minus = () =>{
        if (inputVal > 1)
            setInputVal(inputVal - 1);
    }
    const plus = () => {
        setInputVal(inputVal + 1);
    };
  return (
    <div className="quantityDrop d-flex align-items-center">
      <Button onClick={minus}>
        <FaMinusCircle />
      </Button>
      <input type="text" value={inputVal} />
      <Button onClick={plus}>
        <FaPlusCircle />
      </Button>
    </div>
  );
};

export default QuantityBox;
