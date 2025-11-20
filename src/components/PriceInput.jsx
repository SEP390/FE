import {InputNumber} from "antd";
import {formatPrice} from "../util/formatPrice.js";

const formatter = (value) => {
    return formatPrice(value)
};

const parser = val => {
    try {
        // for when the input gets clears
        if (typeof val === "string" && !val.length) {
            val = "0.0";
        }

        // detecting and parsing between comma and dot
        var group = new Intl.NumberFormat("vi-VN").format(1111).replace(/1/g, "");
        var decimal = new Intl.NumberFormat("vi-VN").format(1.1).replace(/1/g, "");
        var reversedVal = val.replace(new RegExp("\\" + group, "g"), "");
        reversedVal = reversedVal.replace(new RegExp("\\" + decimal, "g"), ".");
        //  => 1232.21 €

        // removing everything except the digits and dot
        reversedVal = reversedVal.replace(/[^0-9.]/g, "");
        //  => 1232.21

        // appending digits properly
        const digitsAfterDecimalCount = (reversedVal.split(".")[1] || []).length;
        const needsDigitsAppended = digitsAfterDecimalCount > 2;

        if (needsDigitsAppended) {
            reversedVal = reversedVal * Math.pow(10, digitsAfterDecimalCount - 2);
        }

        return Number.isNaN(reversedVal) ? 0 : reversedVal;
    } catch (error) {
        console.error(error);
    }
};
export default function PriceInput(props) {
    return <InputNumber className={"!w-full"} parser={parser} formatter={formatter} {...props} />
}