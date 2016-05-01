files = ["barbosa.csv", "clark.csv", "green.csv", "speights.csv", "barnes.csv", "curry.csv", "iguodala.csv", "mcadoo.csv", 
"thompson.csv", "bogut.csv", "ezeli.csv", "livingston.csv", "rush.csv", "holiday.csv", "lee.csv", "kuzmic.csv", "bazemore.csv", 
"blake.csv", "crawford.csv", "oneal.csv", "biedrins.csv", "jack.csv", "jefferson.csv", "jenkins.csv", "landry.csv", "tyler.csv", 
"ellis.csv", "mcguire.csv", "moore.csv", "robinson.csv", "udoh.csv", "wright.csv", "amundson.csv", "carney.csv", "gadzuric.csv", 
"law.csv", "lin.csv", "radmanovic.csv", "williams.csv", "george.csv", "hunter.csv", "maggette.csv", "morrow.csv", "tolliver.csv",
"turiaf.csv", "watson.csv"]
names = ["Leandro Barbosa", "Ian Clark", "Draymond Green", "Marreese Speights", "Harrison Barnes", "Stephen Curry", "Andre Iguodala", 
"James McAdoo", "Klay Thompson", "Andrew Bogut", "Festus Ezeli", "Shaun Livingston", "Brandon Rush", "Justin Holiday", "David Lee", 
"Ognjen Kuzmic", "Kent Bazemore", "Steve Blake", "Jordan Crawford", "Jermaine O'Neal", "Andris Biedrins", "Jarrett Jack", 
"Richard Jefferson", "Charles Jenkins", "Carl Landry", "Jeremy Tyler", "Monta Ellis", "Dominic McGuire", "Mikki Moore", 
"Nate Robinson", "Ekpe Udoh", "Dorell Wright", "Lou Amundson", "Rodney Carney", "Dan Gadzuric", "Acie Law", "Jeremy Lin", 
"Vladimir Radmanovic", "Reggie Williams", "Devean George", "Chris Hunter", "Corey Maggette", "Anthony Morrow", "Anthony Tolliver", 
"Ronny Turiaf", "C.J. Watson"]

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

