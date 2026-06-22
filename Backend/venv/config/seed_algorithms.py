# from algorithms.models import Topic, Algorithm
# from accounts.models import User
# from algorithms.models import AlgorithmRequest, Algorithm
# from accounts.models import User
# from django.utils import timezone

# # -------------------------

# # Create Topics

# # -------------------------

# topics_data = [
#     ("Sorting", "Algorithms used to sort data."),
#     ("Searching", "Algorithms used to search efficiently."),
#     ("Graphs", "Graph traversal and path finding algorithms."),
#     ("Dynamic Programming", "Optimization through memoization and tabulation."),
#     ("Greedy", "Greedy strategy algorithms."),
#     ("Trees", "Binary trees and tree traversals."),
#     ("Backtracking", "Recursive search algorithms."),
#     ("Divide and Conquer", "Breaking problems into sub-problems."),
# ]

# for name, desc in topics_data:
#     Topic.objects.get_or_create(
#         name=name,
#         defaults={"description": desc}
#     )

# # -------------------------

# # Users

# # -------------------------

# owners = [
#     User.objects.get(username="khaled_contrib"),
#     User.objects.get(username="lina_visualizer"),
#     User.objects.get(username="tarek_algorithms"),
#     User.objects.get(username="yasmin_graphs"),
#     User.objects.get(username="mustafa_dp"),
#     User.objects.get(username="algorithm_admin"),
#     User.objects.get(username="user1"),
# ]

# # -------------------------

# # Topics References

# # -------------------------

# sorting = Topic.objects.get(name="Sorting")
# searching = Topic.objects.get(name="Searching")
# graphs = Topic.objects.get(name="Graphs")
# dp = Topic.objects.get(name="Dynamic Programming")
# greedy = Topic.objects.get(name="Greedy")
# trees = Topic.objects.get(name="Trees")
# backtracking = Topic.objects.get(name="Backtracking")
# divide = Topic.objects.get(name="Divide and Conquer")

# # -------------------------

# # Algorithms

# # -------------------------

# algorithms = [

#     ("Bubble Sort", sorting),
#     ("Selection Sort", sorting),
#     ("Insertion Sort", sorting),

#     ("Binary Search", searching),
#     ("Linear Search", searching),

#     ("Depth First Search", graphs),
#     ("Breadth First Search", graphs),
#     ("Dijkstra Shortest Path", graphs),

#     ("Fibonacci DP", dp),
#     ("Knapsack DP", dp),

#     ("Huffman Coding", greedy),
#     ("Activity Selection", greedy),

#     ("Inorder Traversal", trees),
#     ("Preorder Traversal", trees),

#     ("Merge Sort", divide),
# ]

# for index, (title, topic) in enumerate(algorithms):


#     owner = owners[index % len(owners)]

#     Algorithm.objects.get_or_create(
#         title=title,
#         owner=owner,
#         defaults={
#             "description": f"{title} implementation and visualization example.",
#             "code": f"# Python implementation for {title}\npass",
#             "topic": topic,
#             "views_count": (index + 1) * 50,
#             "execution_count": (index + 1) * 15,
#         }
# )


# print("Topics and Algorithms created successfully.")




# admin = User.objects.get(username="algorithm_admin")

# khaled = User.objects.get(username="khaled_contrib")
# lina = User.objects.get(username="lina_visualizer")
# tarek = User.objects.get(username="tarek_algorithms")
# yasmin = User.objects.get(username="yasmin_graphs")
# mustafa = User.objects.get(username="mustafa_dp")

# bubble = Algorithm.objects.filter(title="Bubble Sort").first()
# binary = Algorithm.objects.filter(title="Binary Search").first()
# dfs = Algorithm.objects.filter(title="Depth First Search").first()

# requests = [

# {
#     "request_type": "CREATE",
#     "title": "Quick Sort",
#     "description": "Efficient divide and conquer sorting algorithm.",
#     "code": "def quick_sort(arr): pass",
#     "topic_name": "Sorting",
#     "requested_by": khaled,
#     "status": "PENDING"
# },

# {
#     "request_type": "CREATE",
#     "title": "A* Search",
#     "description": "Pathfinding algorithm used in AI.",
#     "code": "def astar(graph): pass",
#     "topic_name": "Graphs",
#     "requested_by": yasmin,
#     "status": "APPROVED"
# },

# {
#     "request_type": "CREATE",
#     "title": "Heap Sort",
#     "description": "Heap based sorting algorithm.",
#     "code": "def heap_sort(arr): pass",
#     "topic_name": "Sorting",
#     "requested_by": tarek,
#     "status": "REJECTED"
# },

# {
#     "request_type": "UPDATE",
#     "algorithm": bubble,
#     "title": bubble.title,
#     "description": bubble.description + " Updated visualization.",
#     "code": bubble.code,
#     "topic_name": bubble.topic.name,
#     "requested_by": lina,
#     "status": "PENDING"
# },

# {
#     "request_type": "UPDATE",
#     "algorithm": binary,
#     "title": binary.title,
#     "description": binary.description + " Added complexity explanation.",
#     "code": binary.code,
#     "topic_name": binary.topic.name,
#     "requested_by": khaled,
#     "status": "APPROVED"
# },

# {
#     "request_type": "DELETE",
#     "algorithm": dfs,
#     "title": dfs.title,
#     "description": dfs.description,
#     "code": dfs.code,
#     "topic_name": dfs.topic.name,
#     "requested_by": tarek,
#     "status": "PENDING"
# },

# ]

# from algorithms.models import Topic

# for item in requests:

#     topic = Topic.objects.get(name=item["topic_name"])

#     obj = AlgorithmRequest.objects.create(
#         request_type=item["request_type"],
#         algorithm=item.get("algorithm"),
#         title=item["title"],
#         description=item["description"],
#         code=item["code"],
#         topic=topic,
#         requested_by=item["requested_by"],
#         status=item["status"],
# )

# if item["status"] in ["APPROVED", "REJECTED"]:
#     obj.reviewed_by = admin
#     obj.reviewed_at = timezone.now()

#     if item["status"] == "APPROVED":
#         obj.admin_note = "Reviewed and approved."

#     if item["status"] == "REJECTED":
#         obj.admin_note = "Rejected due to insufficient documentation."

#     obj.save()

# print("Algorithm requests created successfully.")


from algorithms.models import DocumentationSection
from accounts.models import User
from django.utils import timezone

# -------------------------
# Get admins safely
# -------------------------

admin_users = User.objects.filter(role__in=["ADMIN", "SUPER_ADMIN"])

admin_list = list(admin_users)

if not admin_list:
    print("⚠️ No admin users found!")
    raise Exception("Admins required before seeding documentation")

# -------------------------
# Documentation Data
# -------------------------

docs = [
    {
        "title": "Bubble Sort Algorithm Guide",
        "content": "This section explains Bubble Sort step by step with visualization logic.",
        "view_count": 120,
    },
    {
        "title": "Binary Search Documentation",
        "content": "Binary search works on sorted arrays with O(log n) complexity.",
        "view_count": 250,
    },
    {
        "title": "Graph Algorithms Overview",
        "content": "Includes BFS, DFS, shortest path algorithms like Dijkstra.",
        "view_count": 320,
    },
    {
        "title": "Dynamic Programming Basics",
        "content": "DP solves problems by breaking them into overlapping subproblems.",
        "view_count": 180,
    },
    {
        "title": "Tree Traversal Techniques",
        "content": "Inorder, preorder, and postorder traversal explanations.",
        "view_count": 90,
    },
]

# -------------------------
# Create Docs
# -------------------------

for index, doc in enumerate(docs):

    creator = admin_list[index % len(admin_list)]

    DocumentationSection.objects.create(
        title=doc["title"],
        content=doc["content"],
        view_count=doc["view_count"],
        created_by=creator,
        updated_by=creator,
        updated_at=timezone.now()
    )

print("Documentation seeded successfully.")