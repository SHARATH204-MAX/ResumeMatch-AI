const UserModel = require('../Models/user');

exports.register = async (req, res) => {
    try {
        const { name, email, photoUrl } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        let userExist = await UserModel.findOne({ email: email });
        if (!userExist) {
            userExist = new UserModel({
                name: name || email.split('@')[0],
                email: email,
                photoUrl: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}`,
                role: "user"
            });
            await userExist.save();
            return res.status(201).json({
                message: "User Registered Successfully",
                user: userExist
            });
        }

        return res.status(200).json({
            message: "Welcome Back",
            user: userExist
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};