const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const { check, validationResult } = require('express-validator');

//create a post
router.post('/', [auth, [
    check('text', 'text is required').not().isEmpty(),
    check('image', 'image are required').not().isEmpty()
]],
    async (req, res) => {
        const {
            text,
            image } = req.body;

        const postfields = {};
        postfields.user = req.user.id;
        if (text) {
            postfields.text = text
        } else {
            res.status(400).send("please fill the text")
        }
        if (image) {
            postfields.image = image
        } else {
            res.status(400).send("please fill the image")
        }
        let post = new Post(postfields);
        post = await post.save();
        res.send(post);
    });
//get post by its id
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id })
        if (!post) return res.status(400).json({ msg: 'there is no posts with this id' });
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});
//delete post by its id
router.delete('/:id', auth, async (req, res) => {
    try {
        //delete USER 
        const p = await Post.findOne({ _id: req.params.id })
        if (!p) return res.status(400).json({ msg: 'there is no posts with this id' });
        else {
            await Post.findOneAndRemove({ _id: req.params.id });
            res.json({ msg: 'post deleted' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});
//update post by its id
router.put('/:id', [auth, [
    check('text', 'text is required').not().isEmpty(),
    check('image', 'image are required').not().isEmpty()
]],
    async (req, res) => {
        const {
            text,
            image } = req.body;

        const postfields = {};
        postfields.user = req.user.id;
        if (text) {
            postfields.text = text
        } else {
            res.status(400).send("please fill the text")
        }
        if (image) {
            postfields.image = image
        } else {
            res.status(400).send("please fill the image")
        }

        let x = await Post.findOne({ _id: req.params.id });
        if (x) {
            let post = await Post.findOneAndUpdate(
                { user: req.user.id },
                { $set: postfields },
                { new: true }
            );
            await post.save();
            return res.json(post);
        } else {
            return res.status(400).send('there is no post with this id')
        }
    });

//all the posts 
router.get('/all/', async (req, res) => {
    try {
        const post = await Post.countDocuments()
        if (!post) return res.status(400).json({ msg: 'there is no posts' });
        res.json(`there is ${post} posts in total`);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

//all posts for a userid
router.get('/all/:userid', async (req, res) => {
    try {
        const post = await Post.countDocuments({ user: req.params.userid })
        if (!post) return res.status(400).json({ msg: 'there is no posts for this user' });
        res.json(`there is ${post} posts in total for this user`);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

module.exports = router;