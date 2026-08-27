import os
import re

heroes = {
    "1056": "Angela",
    "1022": "Captain America",
    "1062": "Devil Dino",
    "1018": "Doctor Strange",
    "1053": "Emma Frost",
    "1027": "Groot",
    "1011": "Bruce Banner",
    "1037": "Magneto",
    "1042": "Peni Parker",
    "1065": "Rogue",
    "1051": "The Thing",
    "1039": "Thor",
    "1035": "Venom",
    "1061": "Black Cat",
    "1026": "Black Panther",
    "1033": "Black Widow",
    "1044": "Blade",
    "1063": "Cyclops",
    "1055": "Daredevil",
    "1059": "Elsa Bloodstone",
    "1021": "Hawkeye",
    "1024": "Hela",
    "1017": "Human Torch",
    "1052": "Iron Fist",
    "1034": "Iron Man",
    "1029": "Magik",
    "1040": "Mister Fantastic",
    "1030": "Moon Knight",
    "1045": "Namor",
    "1054": "Phoenix",
    "1048": "Psylocke",
    "1038": "Scarlet Witch",
    "1036": "Spider-Man",
    "1032": "Squirrel Girl",
    "1043": "Star-Lord",
    "1015": "Storm",
    "1014": "The Punisher",
    "1041": "Winter Soldier",
    "1049": "Wolverine",
    "1046": "Adam Warlock",
    "1025": "Cloak & Dagger",
    "1058": "Gambit",
    "1050": "Invisible Woman",
    "1047": "Jeff",
    "1064": "Jubilee",
    "1016": "Loki",
    "1031": "Luna Snow",
    "1020": "Mantis",
    "1023": "Rocket Raccoon",
    "1028": "Ultron",
    "1060": "White Fox",
    "1057": "Deadpool"
}

folder = os.path.dirname(os.path.abspath(__file__))

keep_suffix = input("Keep suffix after hero ID? Type 'yes' or press Enter: ").strip().lower() == "yes"

for filename in os.listdir(folder):
    match = re.search(r"_(\d{4})(\d+)", filename)

    if match:
        hero_id = match.group(1)
        suffix = match.group(2)

        if hero_id in heroes:
            ext = os.path.splitext(filename)[1]
            hero_name = re.sub(r"[^a-z0-9]", "", heroes[hero_id].lower())

            if keep_suffix:
                new_name = hero_name + suffix + ext.lower()
            else:
                new_name = hero_name + ext.lower()

            old_path = os.path.join(folder, filename)
            new_path = os.path.join(folder, new_name)

            os.rename(old_path, new_path)
            print(f"{filename} -> {new_name}")

print("Done")