## Persian Calendar for *Gnome-Shell*

An extension for Gnome-Shell to show Persian date and calendar

![Screenshot](https://github.com/omid/Persian-Calendar-for-Gnome-Shell/blob/master/assets/screenshot.png?raw=true)

### Installation:

#### Recommended way:
* Go to the official Gnome Shell Extensions website: https://extensions.gnome.org/extension/240/
* Click on the “ON/OFF” button on the top-right of the page.
* If you don't see the extension, go to the [troubleshooting section](README.md#troubleshooting).

#### For developers:
* Clone the repository
* Go to the cloned directory
* run `make` command in the terminal
* Restart Gnome-shell. (ALT+F2, r, Enter)
* You may need to enable the extension via GNOME `Extensions` application

### Troubleshooting:
* I don't see the ON/OFF button, or it's disabled, but I see a blue message on top of the website, with a message like: “To control GNOME Shell extensions using this site you must install GNOME Shell integration that…”. What should I do?
   * In this case, you must install the `chrome-gnome-shell` package on your system. For example, on Ubuntu, you should run: `sudo apt install chrome-gnome-shell`
* I enable the extension, but it doesn't appear and when I refresh the page, it's disabled again! Why?!
   * If you don't have `gnome-tweaks`, first install it. Then open it and go to the “extensions” section. There is a button in the title bar of the window, make sure it's enabled.
   * If you cannot see the “extensions” section in the `gnome-tweaks` application, congratulation, you are using a more up-to-date version of Gnome, so in this case, please use the `gnome-extensions` application and make sure the button is enabled.
* If none of the above works, you can install [Extension Manager](https://github.com/mjakeman/extension-manager#-installing), then install and activate the Persian Calendar extension through it. Extension Manager is a tool for managing GNOME Shell Extensions.
* I the extension seems to work, but the settings window in extension manager reports the following message "Error: Requiring Clutter, version none: Typelib file for namespace '`Clutter'"
   * This error is a result of some clutter libraries no longer being bundled with your OS if you use Ubuntu, please open a terminal and execute 
````$sudo apt install gir1.2-gtkclutter-1.0
   * Or equivalent for your distribution, and restart your windows manager or log out and log back in.

Home
Questions
Tags
Users
Companies
Labs
Jobs
Discussions
Recent Tags
syntax-highlighting
github
linux
mount
bind
Collectives

    Communities for your favorite technologies. Explore all Collectives

Teams

Now available on Stack Overflow for Teams! AI features where you work: search, IDE, and chat.

Monospaced Font w/out Syntax Highlighting in Github Flavored Markdown
Asked 10 years, 11 months ago
Modified 4 years ago
Viewed 25k times
13

The title pretty much says it all: I'd like to write a paragraph in monospaced font using GFM, but without any programming language's syntax highlighting. I'd think it would be

```txt

or

```text

or maybe nothing:

```

But no luck. Is this even possible with GFM?

    githubsyntax-highlightingplaintextmonospace

Share
Improve this question
Follow
edited Oct 22, 2013 at 12:55
asked Oct 22, 2013 at 12:46
Caleb P's user avatar
Caleb P
36111 gold badge22 silver badges1515 bronze badges

    Better for either Web Apps (since it has nothing to do with coding) or direct to GitHub:Support – 
    random
    Commented Oct 28, 2013 at 2:51
    This also doesn't work in gitter ... awful when trying to paste compiler messages. – 
    Luciano
    Commented Mar 6, 2018 at 10:32

Add a comment
Report this ad
1 Answer
Sorted by:
10

Try indenting with four spaces (i.e. a normal markdown code block) rather than using a fenced code block. This worked for me in GitLab. In GitHub just ``` worked.
 restart your windows manager.
### Date formatting:
| Format Code | Meaning | Example Output |
| ----------- | ------- | -------------- |
| `%Y` | Year with century | `۱۴۰۲` |
| `%y` | Year without century (zero-padded) | `۰۲` |
| `%MM` | Month name | `آبان` |
| `%mm` | Month name (short) | `آبا` |
| `%M` | Month number (zero-padded) | `۰۸` |
| `%m` | Month number | `۸` |
| `%D` | Day of the month (zero-padded) | `۰۱` |
| `%d` | Day of the month | `۱` |
| `%WW` | Day of the week | `چهارشنبه` |
| `%ww` | Day of the week (short) | `چهار` |
| `%w` | Day of the week (very short) | `چ` |


### Links:
* :octocat: https://github.com/omid/Persian-Calendar-for-Gnome-Shell
* :link: https://extensions.gnome.org/extension/240/
* :yum: https://www.paypal.me/omidmr/

[Developed with :green_heart:](https://github.com/omid/Persian-Calendar-for-Gnome-Shell/graphs/contributors)
