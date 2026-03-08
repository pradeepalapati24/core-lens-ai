import { Evaluation, Question, RubricScores } from "./types";

export const mockQuestion: Question = {
  id: "q1",
  domain: "Data Structures",
  topic: "Trees",
  subtopic: "Binary Search Tree",
  difficulty: "intermediate",
  questionText: `## Binary Search Tree - Validate BST

Given the root of a binary tree, determine if it is a valid binary search tree (BST).

A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys **less than** the node's key.
- The right subtree of a node contains only nodes with keys **greater than** the node's key.
- Both the left and right subtrees must also be binary search trees.

### Example 1:
\`\`\`
Input: root = [2, 1, 3]
Output: true
\`\`\`

### Example 2:
\`\`\`
Input: root = [5, 1, 4, null, null, 3, 6]
Output: false (4 is in right subtree but 4 < 5 violates BST)
\`\`\`

### Constraints:
- The number of nodes in the tree is in the range [1, 10⁴]
- -2³¹ ≤ Node.val ≤ 2³¹ - 1

Write a function \`isValidBST(root)\` that returns true if the tree is a valid BST.`,
  learningContext: `**Why this concept exists:** Binary Search Trees are fundamental data structures that enable O(log n) search, insertion, and deletion operations when balanced.

**Industry applications:**
- **Database indexing** — B-trees (generalization of BSTs) power database indexes in PostgreSQL, MySQL
- **File systems** — Directory structures use tree-based indexing
- **Search engines** — Autocomplete and search suggestions use tries (a BST variant)
- **Compilers** — Abstract Syntax Trees for parsing code

**Real-world connection:** When you search for a product on Amazon, the backend uses tree-based indexes to find matching products in milliseconds across billions of records.`,
  hints: [
    "Think about what range of values each node can take based on its position in the tree.",
    "An in-order traversal of a valid BST produces a sorted sequence.",
    "Use recursion with min/max bounds — each node must fall within a valid range.",
  ],
  createdAt: new Date().toISOString(),
};

export const mockEvaluation: Evaluation = {
  id: "eval1",
  questionId: "q1",
  finalScore: 7.35,
  rubric: {
    problemUnderstanding: 8,
    algorithmicThinking: 7,
    codeQuality: 7,
    edgeCaseAwareness: 6,
    communicationClarity: 8,
    domainKnowledge: 7,
  },
  strengths: [
    "Clear understanding of BST properties",
    "Good recursive approach with proper base cases",
    "Well-structured code with meaningful variable names",
  ],
  weaknesses: [
    "Did not handle integer overflow edge cases",
    "Could improve space complexity discussion",
    "Missing time complexity analysis",
  ],
  suggestions: [
    "Consider using long/BigInt for boundary values to handle integer overflow",
    "Practice analyzing space complexity of recursive solutions (stack depth)",
    "Add comments explaining the intuition behind the min/max bound approach",
  ],
  nextSteps: [
    "Practice: Lowest Common Ancestor in BST",
    "Practice: Convert Sorted Array to BST",
    "Study: Self-balancing trees (AVL, Red-Black)",
    "Review: Tree traversal patterns (Morris traversal for O(1) space)",
  ],
  expertExplanation: `## Optimal Approach: Recursive Range Validation

The key insight is that each node in a BST has a valid range of values. The root can be any value, but its left child must be less than the root, and its right child must be greater.

\`\`\`python
def isValidBST(root, min_val=float('-inf'), max_val=float('inf')):
    if not root:
        return True
    if root.val <= min_val or root.val >= max_val:
        return False
    return (isValidBST(root.left, min_val, root.val) and
            isValidBST(root.right, root.val, max_val))
\`\`\`

**Time Complexity:** O(n) — visit each node once
**Space Complexity:** O(h) — recursion stack depth, where h is tree height

**Why this works:** By passing down the valid range for each subtree, we ensure every node satisfies the BST property globally, not just locally.`,
  createdAt: new Date().toISOString(),
};

export const mockRecentEvaluations = [
  { id: "1", domain: "Data Structures", topic: "Trees", score: 7.35, date: "2026-03-07" },
  { id: "2", domain: "Algorithms", topic: "Dynamic Programming", score: 6.8, date: "2026-03-06" },
  { id: "3", domain: "System Design", topic: "Scalability", score: 8.1, date: "2026-03-05" },
  { id: "4", domain: "Digital Electronics", topic: "Flip Flops", score: 7.0, date: "2026-03-04" },
  { id: "5", domain: "Operating Systems", topic: "Process Management", score: 5.9, date: "2026-03-03" },
];

export const mockDomainStrengths = [
  { domain: "Data Structures", score: 7.4 },
  { domain: "Algorithms", score: 6.8 },
  { domain: "System Design", score: 8.1 },
  { domain: "Digital Electronics", score: 7.0 },
  { domain: "Operating Systems", score: 5.9 },
  { domain: "Computer Networks", score: 6.5 },
  { domain: "Embedded Systems", score: 7.2 },
];
