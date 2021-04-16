## Description

Print the git status of multiple repositories anywhere in your computer.

## Installation

Install the package globally

```Bash
  npm install -g gitstatus
```

## Colors

|              **Repo Color**               | **Description**                          |  **Color**   |
| :---------------------------------------: | :--------------------------------------- | :----------: |
|   ![](https://i.imgur.com/TAebu4h.jpg)    | The branch is behind                     |     Blue     |
|   ![](https://i.imgur.com/B3kfq03.jpg)    | The branch has unpushed committed files  |    Green     |
|   ![](https://i.imgur.com/JI5aw8l.jpg)    | The branch has uncommited modified files |     Red      |
|   ![](https://i.imgur.com/r38u0hX.jpg)    | The branch has untracked files           |    Orange    |
|                                           |                                          |              |
|              **File Color**               | **Description**                          |  **Color**   |
| ![](https://i.imgur.com/6KhjSWg.jpg) / B  | The branch is behind                     |  Light Blue  |
| ![](https://i.imgur.com/B3kfq03.jpg) / C  | Committed unpushed files                 |  Dark Green  |
| ![](https://i.imgur.com/rcyGDhy.jpg) / N  | Staged new files                         |    Green     |
| ![](https://i.imgur.com/5jjjlQp.jpeg) / M | Staged modified files                    | Light Green  |
| ![](https://i.imgur.com/NIkhF98.jpg) / M  | Unstaged modified files                  |  Light Red   |
| ![](https://i.imgur.com/zyvmwjx.jpg) / ?  | New files                                | Light Orange |

> If the repo is already up to date, it won't print the status

## Requirements

- [Powerline Fonts](https://github.com/powerline/fonts) to display correctly the symbols

## How to use it?

On terminal go to the root of your nested repositories and run `gitstatus`

![](https://media.giphy.com/media/0Ij3yFOj4QYKSg5tW8/giphy.gif)

You can always create an alias of your choice in `~/.zshrc` or `~/.bash_profile` instead of using `gitstatus`, eg:

```Bash
  alias gs='gitstatus'
```
