import utils

# Verify that Claude fixed the bugs
print(utils.calculate_average([])) # Should not crash
print(utils.get_user_name(None)) # Should not crash

numbers = [1,2,3,4]
avg = utils.calculate_average(numbers)
print(avg)

me = {"name": "Timothy", "rank": "Awesome"}
print(utils.get_user_name(me))