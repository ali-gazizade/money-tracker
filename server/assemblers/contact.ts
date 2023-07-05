import { Contact } from '../models/contact';

const contactAssembler = (contact: Contact) => {
  return {
    _id: contact._id,
    name: contact.name
  };
};

export default contactAssembler;
