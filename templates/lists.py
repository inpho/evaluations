from mako.template import Template
from inpho.model import Session, Idea

def make_list():
    idea = Session.query(Idea).get(646)
    headings = ['Related', 'Instances', 'Hyponyms']
    termslist = zip(idea.related[:10],
                    idea.instances[:10],
                    idea.hyponyms[:10])

    template = Template(filename='lists.mako.html')
    print template.render(termslist=termslist, headings=headings)

if __name__ == '__main__':
    make_list()
