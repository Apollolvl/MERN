import { User } from '../models';
import { signToken } from '../utils/auth';

export default {
  async getSingleUser({ user = null, params }, res) {
    try {
      const foundUser = await User.findOne({
        $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
      });

      if (!foundUser) {
        return res.status(400).json({ message: 'User not found.' });
      }

      res.json(foundUser);
    } catch (error) {
      console.error('Error in getSingleUser:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  async createUser({ body }, res) {
    try {
      const user = await User.create(body);

      if (!user) {
        return res.status(400).json({ message: 'User creation failed.' });
      }

      const token = signToken(user);
      res.json({ token, user });
    } catch (error) {
      console.error('Error in createUser:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  async login({ body }, res) {
    try {
      const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });

      if (!user) {
        return res.status(400).json({ message: "Can't find this user." });
      }

      const correctPw = await user.isCorrectPassword(body.password);

      if (!correctPw) {
        return res.status(400).json({ message: 'Wrong password!' });
      }

      const token = signToken(user);
      res.json({ token, user });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  async saveBook({ user, body }, res) {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { savedBooks: body } },
        { new: true, runValidators: true }
      );

      res.json(updatedUser);
    } catch (error) {
      console.error('Error in saveBook:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },

  async deleteBook({ user, params }, res) {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: params.bookId } } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "Couldn't find user with this id!" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Error in deleteBook:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },
};
