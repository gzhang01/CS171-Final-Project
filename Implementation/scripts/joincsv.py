files = ["barbosa.csv", "clark.csv", "green.csv", "looney.csv", "speights.csv", "barnes.csv", "curry.csv", "iguodala.csv", "mcadoo.csv", "thompson.csv", "bogut.csv", "ezeli.csv", "livingston.csv", "rush.csv", "varejao.csv", "holiday.csv", "lee.csv", "kuzmic.csv", "armstrong.csv", "bazemore.csv"]
names = ["Leandro Barbosa", "Ian Clark", "Draymond Green", "Kevon Looney", "Marreese Speights", "Harrison Barnes", "Stephen Curry", "Andre Iguodala", "James McAdoo", "Klay Thompson", "Andrew Bogut", "Festus Ezeli", "Shaun Livingston", "Brandon Rush", "Anderson Varejao", "Justin Holiday", "David Lee", "Ognjen Kuzmic", "Hilton Armstrong", "Kent Bazemore"]

with open("../data/vis3/all.csv", "w") as f:
	f.write("Name,Season,Age,Tm,Lg,Pos,G,GS,MP,FG,FGA,FG%,3P,3PA,3P%,2P,2PA,2P%,FT,FTA,FT%,ORB,DRB,TRB,AST,STL,BLK,TOV,PF,PTS\n")

for i in xrange(len(files)):
	data = []
	loc = "../data/vis3/" + files[i]
	with open(loc, "r") as f:
		data = f.readlines()
	for row in xrange(1, len(data)):
		if data[row][-1] == '\n':
			data[row] = data[row][:-1]
		with open("../data/vis3/all.csv", "a") as f:
			f.write(names[i] + "," + data[row] + "\n")

