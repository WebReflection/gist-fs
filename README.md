# gist-fs

<sup>**Social Media Photo by [Gary Ellis](https://unsplash.com/@garyellisphoto) on [Unsplash](https://unsplash.com/)**</sup>


A daily rate-limited way to have free storage in the wild.

## ⚠️ Warning

  * the **first rule** of this module, is that **you don't expose your GitHub token** in the wild
  * the **second rule** of this module, is that **you don't ignore the first rule** in this list
  * the **third rule** of this module is that **it's your fault if you ignored previous rules** on this list

If these rules are reasonable enough and understood, we're good to go!

## 🛈 GitHub Token

In order to use this module, in a way or another, you need to generate a new token, possibly dedicated to *gists* things only.

Please [go here](https://github.com/settings/tokens) to do so, once you are logged in, and do the following:

![Generate new token](./assets/generate-token.png)

Once you are in that lovely interface, please constrain such token to deal with *gists* only:

![Setup token](./assets/setup-token.png)

Once you have done that and you have your *read-once* token, please do not store it in any *HTML* or *JS* or *CSS* file, or anyone else, as that's your token to be able to use this module and you don't want that to be abused by anyone out there.

**If your token leaks** please remember to start again the procedure, remove the previous one, and not commit the same mistake again, thank you!

**[Live Demo](https://webreflection.github.io/gist-fs/test/) that creates a new Gist** on your behalf once you have provided your TOKEN and checked the devtools console.

- - -

Now, because I am going on vacation you can have a *gist* (no pun intended) of how this module works, out of the [index.html](./test/index.html) file which already code cover most of this module.
