"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contactAssembler = (contact) => {
    return {
        _id: contact._id,
        name: contact.name
    };
};
exports.default = contactAssembler;
