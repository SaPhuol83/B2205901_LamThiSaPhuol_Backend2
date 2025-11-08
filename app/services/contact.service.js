const { ObjectId } = require("mongodb");

class ContactService {
  constructor(client) {
    this.Contact = client.db().collection("contacts");
  }
  // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
  extractConactData(payload) {
    const contact = {
      name: payload.name,
      email: payload.email,
      address: payload.address,
      phone: payload.phone,
      favorite: payload.favorite,
    };
    // Remove undefined fields
    Object.keys(contact).forEach(
      (key) => contact[key] === undefined && delete contact[key]
    );
    return contact;
  }

  async create(payload) {
    const contact = this.extractConactData(payload);
    const result = await this.Contact.findOneAndUpdate(
      contact,
      { $set: { favorite: contact.favorite === true } },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }

  // Tìm kiếm các tài liệu thoả điều kiện
  async find(filter) {
    const cursor = await this.Contact.find(filter);
    return await cursor.toArray();
  }

  // Tìm kiếm các tài liệu theo tên name
  async findByName(name) {
    return await this.find({
      name: { $regex: new RegExp(new RegExp(name)), $options: "i" },
    });
  }

  // Tìm kiếm tài liệu theo Id
  async findById(id) {
    return await this.Contact.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  // Tìm kiếm tài liệu theo Id và cập nhật tài liệu này
  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractConactData(payload);
    const result = await this.Contact.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }

  // Tìm kiếm tài liệu theo Id và xoá tài liệu này
  async delete(id) {
    const result = await this.Contact.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  // Tìm kiếm Favorite
  async findFavorite() {
    return await this.find({ favorite: true });
  }

  // Xoá tất cả các đối tượng trong collection
  async deleteAll() {
    const result = await this.Contact.deleteMany({});
    return result.deleteCount;
  }
}

module.exports = ContactService;
