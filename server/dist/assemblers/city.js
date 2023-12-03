"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cityAssembler = (city) => {
    return {
        _id: city._id,
        name: city.name,
        countryName: city.countryName
    };
};
exports.default = cityAssembler;
