# Grader Fixer

## SUMMARY
Just a simple script to make the grader easier to use. There are some much needed updates for the site that have not been implemented yet, so I just decided to do it myself.

## FEATURES
1. When the assignment has been graded previously, the grade is displayed in "Comments", next to the timestamp for the specific grader comment.
2. All comments are split up by line instead of displayed in one massive block of text, making it easy to read both comments from previous graders and from the students.
3. Rubric has been added to the "Rubric" section (work in progress, style is very bad)
4. Displaying of assignments on the "Claimed by Me" page has been fixed.
    1. Problem with "Active" assignments being spread across multiple pages is fixed.
    2. Pagination has been removed. Each category (Active, Past Due, Waiting for Review) is displayed in its own single scrollable list.
    3. Speed improved. No more loading of assignments when switching category, it is automatic.

## BUGS
If you run into any problems or bugs, please submit an issue on GitHub. https://github.com/MorganLee909/grader-fixer/issues

## USAGE
The usage of this script requires the Tampermonkey browser extension for Firefox or Chrome.

Firefox: https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/

Chrome: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo

After installing the extension, open it and create a new script. Then just delete all of the boilerplate and copy/paste the entire script from this repository. Make sure that you leave the commented code at the top, as this will detect the webpage. After this, the updates should be applied once you refresh the page.

## NOTES
1. This is still a work in progress, so there may be some issues depending on your environment. Also, more to come soon.
2. If you run into an error that is making it unusable, you can use the Tampermonkey extension to simply turn the script off and go back to the default page.


## Examples
![Update comment view](./commentExample.png "Comments/Grades Updated View")
![Rubric view](./rubricExample.png "Rubric")