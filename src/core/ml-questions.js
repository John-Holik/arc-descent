// Bundled ML+RAG study bank: content/ML-RAG-questions.csv through the shared parser.
// Grounded in the vault learning plan (Track A RAG, PyTorch, SQL, evaluation methodology).
// Regenerate after editing the CSV — never hand-edit.
export const ML_QUESTIONS = [
 {
  "question": "In supervised learning, the model learns from…",
  "choices": [
   "Labeled examples (input paired with correct output)",
   "Unlabeled data only",
   "Trial-and-error rewards"
  ],
  "answer": "Labeled examples (input paired with correct output)",
  "why": "Supervision means every training example carries the right answer to imitate",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "A 'feature' in machine learning is…",
  "choices": [
   "An input variable the model uses to predict",
   "The model's output",
   "A bug in the data"
  ],
  "answer": "An input variable the model uses to predict",
  "why": "Features are the columns the model reads; the label is what it predicts",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "A 'label' is…",
  "choices": [
   "The correct output the model should learn to predict",
   "An input column",
   "The model's name"
  ],
  "answer": "The correct output the model should learn to predict",
  "why": "Labels are the ground truth that training pushes predictions toward",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Classification predicts…",
  "choices": [
   "A discrete category",
   "A continuous number",
   "The training speed"
  ],
  "answer": "A discrete category",
  "why": "Spam or not, cat or dog: classification picks from a fixed set of classes",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Regression predicts…",
  "choices": [
   "A continuous number",
   "A discrete category",
   "A cluster id"
  ],
  "answer": "A continuous number",
  "why": "House prices and temperatures are regression targets: any value on a scale",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Why split data into train and test sets?",
  "choices": [
   "To measure performance on data the model has never seen",
   "To make training faster",
   "To use less memory"
  ],
  "answer": "To measure performance on data the model has never seen",
  "why": "Scoring on training data rewards memorization; the test set estimates real-world skill",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Overfitting means the model…",
  "choices": [
   "Memorized the training data and fails on new data",
   "Is too simple to learn anything",
   "Trains too slowly"
  ],
  "answer": "Memorized the training data and fails on new data",
  "why": "It learned the noise, not the pattern, so it can't generalize",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Underfitting means the model…",
  "choices": [
   "Is too simple to capture the real pattern",
   "Memorized the noise",
   "Has too many parameters"
  ],
  "answer": "Is too simple to capture the real pattern",
  "why": "It does badly on training AND test data because it can't represent the signal",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Unsupervised learning works with…",
  "choices": [
   "Unlabeled data, finding structure on its own",
   "Labeled examples",
   "Reward signals from an environment"
  ],
  "answer": "Unlabeled data, finding structure on its own",
  "why": "No answers are given; the algorithm discovers groups or patterns itself",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Clustering is an example of…",
  "choices": [
   "Unsupervised learning",
   "Supervised learning",
   "Reinforcement learning"
  ],
  "answer": "Unsupervised learning",
  "why": "Grouping similar points needs no labels, so it's unsupervised",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "A loss function measures…",
  "choices": [
   "How wrong the model's predictions are",
   "How fast the model runs",
   "How large the dataset is"
  ],
  "answer": "How wrong the model's predictions are",
  "why": "Training is just minimizing this number; lower loss means better fit",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Training a model means…",
  "choices": [
   "Adjusting its parameters to reduce the loss",
   "Writing if-else rules by hand",
   "Cleaning the data"
  ],
  "answer": "Adjusting its parameters to reduce the loss",
  "why": "Learning is iterative parameter updates driven by the loss signal",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Reinforcement learning learns from…",
  "choices": [
   "Rewards and penalties for actions taken",
   "Labeled input-output pairs",
   "Nearest neighbors"
  ],
  "answer": "Rewards and penalties for actions taken",
  "why": "An agent acts, the environment scores it, and behavior shifts toward reward",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "A validation set is used to…",
  "choices": [
   "Tune choices like hyperparameters without touching the test set",
   "Train the model's weights",
   "Store backup data"
  ],
  "answer": "Tune choices like hyperparameters without touching the test set",
  "why": "You pick settings on validation data so the test set stays an honest final exam",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Your model scores 99% on training data but 62% on test data. Most likely:",
  "choices": [
   "Overfitting",
   "Underfitting",
   "The metrics are broken"
  ],
  "answer": "Overfitting",
  "why": "A big train-test gap is the classic signature of memorization",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Which model would most likely underfit a complex nonlinear pattern?",
  "choices": [
   "A straight-line (linear) model",
   "A deep neural network",
   "A random forest with deep trees"
  ],
  "answer": "A straight-line (linear) model",
  "why": "A line can't bend to follow curves in the data",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Why is accuracy misleading on a 99-to-1 imbalanced dataset?",
  "choices": [
   "Predicting the majority class every time already scores 99%",
   "Accuracy can't be computed on imbalanced data",
   "Imbalance makes training crash"
  ],
  "answer": "Predicting the majority class every time already scores 99%",
  "why": "A useless model looks great, so you need precision, recall, or F1 instead",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "k-nearest-neighbors classifies a new point by…",
  "choices": [
   "The labels of the closest training examples",
   "A learned weight matrix",
   "Random sampling"
  ],
  "answer": "The labels of the closest training examples",
  "why": "kNN stores the data and votes among the k nearest points at prediction time",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "A decision tree makes predictions by…",
  "choices": [
   "Asking a series of feature-threshold questions that best separate the classes",
   "Multiplying weight matrices",
   "Averaging all the features"
  ],
  "answer": "Asking a series of feature-threshold questions that best separate the classes",
  "why": "Each split narrows down the data until a leaf gives the answer",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "One-hot encoding is used to…",
  "choices": [
   "Turn categories into numeric vectors a model can use",
   "Compress images",
   "Normalize continuous values"
  ],
  "answer": "Turn categories into numeric vectors a model can use",
  "why": "Models need numbers, so 'red/green/blue' becomes [1,0,0] style vectors",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Feature scaling helps many models because…",
  "choices": [
   "Features on wildly different ranges can dominate distances and gradients",
   "It removes outliers automatically",
   "It creates new labels"
  ],
  "answer": "Features on wildly different ranges can dominate distances and gradients",
  "why": "Putting features on comparable scales keeps one column from drowning out the rest",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "The 'curse of dimensionality' refers to…",
  "choices": [
   "Data becoming sparse and distances less meaningful as features grow",
   "Having too many rows",
   "Running out of GPU cores"
  ],
  "answer": "Data becoming sparse and distances less meaningful as features grow",
  "why": "In very high dimensions everything is far from everything, hurting similarity-based methods",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Data leakage means…",
  "choices": [
   "Information from the test set or the future sneaks into training, inflating scores",
   "Losing rows during cleaning",
   "The GPU memory overflows"
  ],
  "answer": "Information from the test set or the future sneaks into training, inflating scores",
  "why": "Leakage makes offline scores lie: the model saw hints it won't have in production",
  "difficulty": "hard",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Why can a random train/test split be wrong for time-series data?",
  "choices": [
   "It lets the model train on the future and predict the past",
   "Time-series can't be split at all",
   "Random splits are too slow"
  ],
  "answer": "It lets the model train on the future and predict the past",
  "why": "Real deployment predicts forward in time, so the split must respect time order",
  "difficulty": "hard",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Gradient descent updates parameters by…",
  "choices": [
   "Stepping opposite the gradient of the loss",
   "Random guessing until loss drops",
   "Sorting the weights"
  ],
  "answer": "Stepping opposite the gradient of the loss",
  "why": "The gradient points uphill, so you walk downhill to reduce the loss",
  "difficulty": "easy",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "The learning rate controls…",
  "choices": [
   "The size of each update step",
   "The size of the dataset",
   "The number of output classes"
  ],
  "answer": "The size of each update step",
  "why": "It scales the gradient step: too big overshoots, too small crawls",
  "difficulty": "easy",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Setting the learning rate too high typically causes…",
  "choices": [
   "The loss to diverge or bounce around",
   "Slower but stable training",
   "No visible effect"
  ],
  "answer": "The loss to diverge or bounce around",
  "why": "Giant steps leap over the valley instead of settling into it",
  "difficulty": "easy",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "An epoch is…",
  "choices": [
   "One full pass over the training data",
   "One weight update",
   "One evaluation run"
  ],
  "answer": "One full pass over the training data",
  "why": "Training usually takes many epochs, each visiting every example once",
  "difficulty": "easy",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Precision answers the question:",
  "choices": [
   "Of the items I flagged positive, how many really were?",
   "Of all real positives, how many did I find?",
   "How fast does the model run?"
  ],
  "answer": "Of the items I flagged positive, how many really were?",
  "why": "Precision is about the purity of your positive predictions",
  "difficulty": "easy",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Recall answers the question:",
  "choices": [
   "Of all real positives, how many did I find?",
   "Of the items I flagged, how many were right?",
   "How large is the model?"
  ],
  "answer": "Of all real positives, how many did I find?",
  "why": "Recall is about coverage: missing a real positive hurts recall",
  "difficulty": "easy",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Regularization is used to…",
  "choices": [
   "Fight overfitting by penalizing complexity",
   "Speed up inference",
   "Add more features"
  ],
  "answer": "Fight overfitting by penalizing complexity",
  "why": "A complexity penalty nudges the model toward simpler, more general solutions",
  "difficulty": "easy",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Cross-validation gives you…",
  "choices": [
   "A more reliable performance estimate from multiple train/validation splits",
   "Faster training",
   "More training data"
  ],
  "answer": "A more reliable performance estimate from multiple train/validation splits",
  "why": "Averaging over k folds smooths out the luck of any single split",
  "difficulty": "easy",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "F1 score is…",
  "choices": [
   "The harmonic mean of precision and recall",
   "The average of accuracy and recall",
   "Precision minus recall"
  ],
  "answer": "The harmonic mean of precision and recall",
  "why": "The harmonic mean punishes you when either precision or recall is low",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "High bias, low variance describes a model that is…",
  "choices": [
   "Consistently wrong in the same way because it's too simple",
   "Wildly different across training runs",
   "Perfectly calibrated"
  ],
  "answer": "Consistently wrong in the same way because it's too simple",
  "why": "Bias is systematic error: the model can't represent the true pattern",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "High variance means…",
  "choices": [
   "Small changes in training data swing the predictions a lot",
   "The model is too simple",
   "The labels are all wrong"
  ],
  "answer": "Small changes in training data swing the predictions a lot",
  "why": "A high-variance model fits each dataset's quirks, so it's unstable",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "L2 regularization (weight decay) works by…",
  "choices": [
   "Penalizing large weights so the model stays smoother",
   "Deleting features",
   "Duplicating training data"
  ],
  "answer": "Penalizing large weights so the model stays smoother",
  "why": "Big weights mean sharp sensitive functions; L2 shrinks them toward zero",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "L1 regularization tends to…",
  "choices": [
   "Drive some weights exactly to zero, acting as feature selection",
   "Make all weights equal",
   "Increase overfitting"
  ],
  "answer": "Drive some weights exactly to zero, acting as feature selection",
  "why": "The L1 penalty's corners push small weights all the way to zero",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Early stopping fights overfitting by…",
  "choices": [
   "Halting training when validation loss stops improving",
   "Using a bigger model",
   "Lowering the batch size"
  ],
  "answer": "Halting training when validation loss stops improving",
  "why": "You stop at the model's best generalization point instead of letting it memorize",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "A confusion matrix shows…",
  "choices": [
   "Counts of predicted vs actual classes",
   "The model's weights",
   "Training speed over time"
  ],
  "answer": "Counts of predicted vs actual classes",
  "why": "It breaks accuracy into true/false positives and negatives per class",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Mini-batch gradient descent differs from full-batch by…",
  "choices": [
   "Updating on small random subsets of the data",
   "Never converging",
   "Using no gradients"
  ],
  "answer": "Updating on small random subsets of the data",
  "why": "Small batches give frequent, cheap, slightly noisy updates that scale to big data",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Raising the classification threshold usually…",
  "choices": [
   "Increases precision and lowers recall",
   "Increases both",
   "Lowers both"
  ],
  "answer": "Increases precision and lowers recall",
  "why": "Being pickier means fewer flagged items (purer) but more missed positives",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Hyperparameters are…",
  "choices": [
   "Settings chosen before training, like learning rate and tree depth",
   "Weights learned during training",
   "Rows of the dataset"
  ],
  "answer": "Settings chosen before training, like learning rate and tree depth",
  "why": "The model learns parameters; you choose hyperparameters",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "A ROC curve plots…",
  "choices": [
   "True positive rate against false positive rate across thresholds",
   "Loss against epochs",
   "Precision against F1"
  ],
  "answer": "True positive rate against false positive rate across thresholds",
  "why": "It shows the whole tradeoff space as you sweep the decision threshold",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Dropout regularizes a network by…",
  "choices": [
   "Randomly disabling units during training so the net can't over-rely on any one",
   "Removing training rows",
   "Freezing the weights"
  ],
  "answer": "Randomly disabling units during training so the net can't over-rely on any one",
  "why": "Random knockouts force redundant, robust representations",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "An AUC of 0.5 means…",
  "choices": [
   "The model ranks positives no better than coin flips",
   "Perfect classification",
   "The model always predicts negative"
  ],
  "answer": "The model ranks positives no better than coin flips",
  "why": "0.5 is the diagonal: random ranking. 1.0 is perfect separation",
  "difficulty": "hard",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Why tune hyperparameters on a validation set instead of the test set?",
  "choices": [
   "Tuning on the test set leaks it, so the final score stops being honest",
   "The test set is too small",
   "Validation sets train faster"
  ],
  "answer": "Tuning on the test set leaks it, so the final score stops being honest",
  "why": "Every tuning peek at the test set quietly overfits your choices to it",
  "difficulty": "hard",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Validation loss falls, then rises, while training loss keeps falling. That turning point is…",
  "choices": [
   "Where overfitting begins",
   "A learning-rate warmup artifact",
   "Proof of underfitting"
  ],
  "answer": "Where overfitting begins",
  "why": "Past that point the model improves on training data by memorizing it",
  "difficulty": "hard",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Random search often beats grid search for hyperparameters when…",
  "choices": [
   "Only a few hyperparameters really matter, so random covers each range better",
   "There is exactly one hyperparameter",
   "The grid is tiny"
  ],
  "answer": "Only a few hyperparameters really matter, so random covers each range better",
  "why": "Grid wastes trials repeating values of unimportant knobs; random explores more of each axis",
  "difficulty": "hard",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "An artificial neuron computes…",
  "choices": [
   "A weighted sum of inputs passed through an activation function",
   "A database lookup",
   "A sorted list"
  ],
  "answer": "A weighted sum of inputs passed through an activation function",
  "why": "Weights scale each input, the sum is squashed by the activation",
  "difficulty": "easy",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "Activation functions exist to…",
  "choices": [
   "Add nonlinearity so networks can learn complex patterns",
   "Slow down training",
   "Store memory between runs"
  ],
  "answer": "Add nonlinearity so networks can learn complex patterns",
  "why": "Without them, stacked layers collapse into one linear function",
  "difficulty": "easy",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "Backpropagation is…",
  "choices": [
   "The algorithm that computes gradients layer by layer, backwards",
   "A way to load data",
   "A GPU driver"
  ],
  "answer": "The algorithm that computes gradients layer by layer, backwards",
  "why": "The chain rule walks the error signal back so every weight knows its blame",
  "difficulty": "easy",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "A 'deep' network is one with…",
  "choices": [
   "Many layers",
   "Many rows of data",
   "A big hard drive"
  ],
  "answer": "Many layers",
  "why": "Depth means stacked layers, letting features build on features",
  "difficulty": "easy",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "ReLU outputs…",
  "choices": [
   "The input if positive, else zero",
   "Always 1",
   "The square of the input"
  ],
  "answer": "The input if positive, else zero",
  "why": "max(0, x): cheap, simple, and it keeps gradients healthy in deep nets",
  "difficulty": "easy",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "PyTorch's autograd does what for you?",
  "choices": [
   "Tracks operations and computes gradients automatically",
   "Downloads datasets",
   "Writes the training loop"
  ],
  "answer": "Tracks operations and computes gradients automatically",
  "why": "You define the forward pass; autograd builds the backward pass for free",
  "difficulty": "easy",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "An embedding is…",
  "choices": [
   "A learned dense vector that represents meaning",
   "A compressed zip file",
   "A database index"
  ],
  "answer": "A learned dense vector that represents meaning",
  "why": "Embeddings map words, sentences, or items into a space where distance means similarity",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "Words or tokens with similar meaning end up…",
  "choices": [
   "Close together in embedding space",
   "In alphabetical order",
   "In the same file"
  ],
  "answer": "Close together in embedding space",
  "why": "That geometry is the whole point: similarity becomes measurable distance",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "Tokenization converts text into…",
  "choices": [
   "Subword units the model processes as ids",
   "Whole sentences only",
   "Pixels"
  ],
  "answer": "Subword units the model processes as ids",
  "why": "Models read token ids; rare words split into smaller known pieces",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "The attention mechanism lets a transformer…",
  "choices": [
   "Weigh how much each token should look at every other token",
   "Skip training",
   "Compress images"
  ],
  "answer": "Weigh how much each token should look at every other token",
  "why": "Each token gathers information from the tokens most relevant to it",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "Self-attention is called 'self' because…",
  "choices": [
   "The sequence attends to its own tokens",
   "The model trains itself",
   "It runs without a GPU"
  ],
  "answer": "The sequence attends to its own tokens",
  "why": "Queries, keys, and values all come from the same sequence",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "Why did transformers displace RNNs for language?",
  "choices": [
   "They process all tokens in parallel and handle long-range dependencies better",
   "They use less electricity",
   "They have fewer parameters"
  ],
  "answer": "They process all tokens in parallel and handle long-range dependencies better",
  "why": "No sequential bottleneck to train, and attention connects distant tokens directly",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "A softmax layer outputs…",
  "choices": [
   "A probability distribution over classes",
   "Raw unbounded scores",
   "Binary bits"
  ],
  "answer": "A probability distribution over classes",
  "why": "It exponentiates and normalizes scores so they sum to 1",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "Pretraining a language model means…",
  "choices": [
   "Training on huge general text before any task-specific tuning",
   "Testing before training",
   "Compiling the code"
  ],
  "answer": "Training on huge general text before any task-specific tuning",
  "why": "General language skill is learned once, then specialized cheaply",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "Fine-tuning is…",
  "choices": [
   "Continuing training of a pretrained model on your specific data",
   "Training from random weights",
   "Writing better prompts"
  ],
  "answer": "Continuing training of a pretrained model on your specific data",
  "why": "You start from learned knowledge and nudge the weights toward your task",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "The vanishing gradient problem is…",
  "choices": [
   "Gradients shrinking toward zero through deep layers, stalling learning",
   "Losing the dataset",
   "A GPU overheating"
  ],
  "answer": "Gradients shrinking toward zero through deep layers, stalling learning",
  "why": "Tiny gradients mean early layers barely learn; architectures like ResNets fight this",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "Batch size is…",
  "choices": [
   "How many examples are processed per weight update",
   "The total dataset size",
   "The number of layers"
  ],
  "answer": "How many examples are processed per weight update",
  "why": "Bigger batches give smoother gradients but cost more memory per step",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "GPUs accelerate deep learning because…",
  "choices": [
   "Neural network math is mostly parallel matrix operations",
   "They have bigger hard drives",
   "They run Python faster"
  ],
  "answer": "Neural network math is mostly parallel matrix operations",
  "why": "Thousands of cores multiply matrices at once; that's exactly what nets need",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "On an 8 GB VRAM card, a 7B-parameter model at 16-bit precision…",
  "choices": [
   "Doesn't fit: 7B times 2 bytes is about 14 GB before activations",
   "Fits with room to spare",
   "Needs exactly 8 GB"
  ],
  "answer": "Doesn't fit: 7B times 2 bytes is about 14 GB before activations",
  "why": "Two bytes per weight means 7B parameters cost ~14 GB; quantization is how it fits",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "Quantization shrinks a model by…",
  "choices": [
   "Storing weights in fewer bits, like 4-bit instead of 16",
   "Deleting layers",
   "Shortening the prompt"
  ],
  "answer": "Storing weights in fewer bits, like 4-bit instead of 16",
  "why": "Lower precision per weight trades a little quality for a lot of memory",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "In attention, the Query, Key, and Value vectors are…",
  "choices": [
   "Learned projections of the tokens, used to score and mix information",
   "Three separate datasets",
   "Fixed constants"
  ],
  "answer": "Learned projections of the tokens, used to score and mix information",
  "why": "Query-Key dot products decide who attends to whom; Values carry the content",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "Residual (skip) connections help deep networks by…",
  "choices": [
   "Giving gradients a direct path so very deep stacks still train",
   "Skipping the test set",
   "Reducing parameters to zero"
  ],
  "answer": "Giving gradients a direct path so very deep stacks still train",
  "why": "The shortcut around each block keeps the error signal strong through depth",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "LoRA fine-tunes efficiently by…",
  "choices": [
   "Training small low-rank adapter matrices instead of all the weights",
   "Lowering the learning rate",
   "Freezing the entire model with no additions"
  ],
  "answer": "Training small low-rank adapter matrices instead of all the weights",
  "why": "Tiny adapters capture the task shift, so an 8 GB card can fine-tune big models",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "Positional encodings exist because…",
  "choices": [
   "Attention alone has no sense of token order",
   "Tokens are too long",
   "GPUs need indexes"
  ],
  "answer": "Attention alone has no sense of token order",
  "why": "Attention treats input as a set; positions must be injected explicitly",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "LLMs generate text by…",
  "choices": [
   "Predicting the next token repeatedly",
   "Copying from a database",
   "Running grammar rules"
  ],
  "answer": "Predicting the next token repeatedly",
  "why": "Each generated token is appended and the model predicts the next, in a loop",
  "difficulty": "easy",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "A token is…",
  "choices": [
   "A chunk of text, often part of a word, that the model reads and writes",
   "Always a full sentence",
   "A password"
  ],
  "answer": "A chunk of text, often part of a word, that the model reads and writes",
  "why": "Models see token ids, not letters; 'unbelievable' may be 3 tokens",
  "difficulty": "easy",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "The context window is…",
  "choices": [
   "The maximum tokens the model can consider at once",
   "The chat history file",
   "The GPU memory"
  ],
  "answer": "The maximum tokens the model can consider at once",
  "why": "Everything the model 'knows' about your conversation must fit in it",
  "difficulty": "easy",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "Temperature 0 makes output…",
  "choices": [
   "Nearly deterministic, picking the most likely token",
   "More creative",
   "Longer"
  ],
  "answer": "Nearly deterministic, picking the most likely token",
  "why": "Zero temperature collapses sampling to the argmax token every step",
  "difficulty": "easy",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "LLM API cost is usually billed by…",
  "choices": [
   "Tokens in and out",
   "Wall-clock minutes",
   "Number of sentences"
  ],
  "answer": "Tokens in and out",
  "why": "Both the prompt you send and the completion you get back count",
  "difficulty": "easy",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "Streaming responses means…",
  "choices": [
   "Receiving tokens as they are generated instead of waiting for the full answer",
   "Downloading the model",
   "Playing audio"
  ],
  "answer": "Receiving tokens as they are generated instead of waiting for the full answer",
  "why": "Streaming cuts perceived latency: the first words arrive immediately",
  "difficulty": "easy",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "Raising temperature…",
  "choices": [
   "Flattens the token distribution so sampling gets more random",
   "Speeds up inference",
   "Adds more tokens to context"
  ],
  "answer": "Flattens the token distribution so sampling gets more random",
  "why": "Higher temperature gives unlikely tokens more chance: more diverse, less reliable",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "A hallucination is…",
  "choices": [
   "Confident output that is factually wrong or invented",
   "A GPU error",
   "An answer that is too long"
  ],
  "answer": "Confident output that is factually wrong or invented",
  "why": "The model optimizes plausible text, not truth; fluency is not accuracy",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "A system prompt is…",
  "choices": [
   "Standing instructions that frame the model's behavior for the whole conversation",
   "The first user question",
   "The model's training data"
  ],
  "answer": "Standing instructions that frame the model's behavior for the whole conversation",
  "why": "It sets role, rules, and tone before any user input arrives",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "Few-shot prompting means…",
  "choices": [
   "Showing worked examples in the prompt so the model imitates the pattern",
   "Training for a few epochs",
   "Using a small model"
  ],
  "answer": "Showing worked examples in the prompt so the model imitates the pattern",
  "why": "Examples in-context steer format and style with no training at all",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "Forcing structured output like JSON matters because…",
  "choices": [
   "Downstream code needs reliably parseable responses",
   "It makes answers smarter",
   "It saves VRAM"
  ],
  "answer": "Downstream code needs reliably parseable responses",
  "why": "An app can't branch on prose; schemas make LLM output programmable",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "Tool use (function calling) lets an LLM…",
  "choices": [
   "Request an external action like search or code instead of guessing",
   "Rewrite its own weights",
   "Run without prompts"
  ],
  "answer": "Request an external action like search or code instead of guessing",
  "why": "The model emits a structured call, your code runs it, and the result comes back",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "An 'agent' in LLM engineering is…",
  "choices": [
   "A loop where the model plans, calls tools, and reacts to results toward a goal",
   "Any chatbot",
   "A human reviewer"
  ],
  "answer": "A loop where the model plans, calls tools, and reacts to results toward a goal",
  "why": "Agent = LLM + tools + a loop with feedback, not just one-shot Q&A",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "Why do very long conversations degrade LLM answers?",
  "choices": [
   "Earlier content falls outside or gets diluted in the context window",
   "The model gets tired",
   "Tokens expire after an hour"
  ],
  "answer": "Earlier content falls outside or gets diluted in the context window",
  "why": "The window is finite; what scrolls out of it is gone for the model",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "LLM-as-judge evaluation means…",
  "choices": [
   "Using a strong model to grade another model's outputs against criteria",
   "A courtroom transcript dataset",
   "Human-only review"
  ],
  "answer": "Using a strong model to grade another model's outputs against criteria",
  "why": "It scales evaluation cheaply, though the judge itself must be validated",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "The same prompt gives different answers each run. The usual cause is…",
  "choices": [
   "Sampling randomness from temperature above 0",
   "The weights changed overnight",
   "A memory leak"
  ],
  "answer": "Sampling randomness from temperature above 0",
  "why": "Nonzero temperature draws from a distribution, so runs differ by design",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "Prompt injection is…",
  "choices": [
   "Malicious text in the input that hijacks the model's instructions",
   "A vaccination dataset",
   "A CUDA feature"
  ],
  "answer": "Malicious text in the input that hijacks the model's instructions",
  "why": "Untrusted content can carry instructions; treat retrieved and user text as data, not commands",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "top-p (nucleus) sampling…",
  "choices": [
   "Samples only from the smallest set of tokens whose probabilities sum to p",
   "Always picks the p-th token",
   "Truncates the prompt to p tokens"
  ],
  "answer": "Samples only from the smallest set of tokens whose probabilities sum to p",
  "why": "It cuts off the long unlikely tail while keeping natural variety",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "Why does an eval harness matter more for LLM apps than unit tests alone?",
  "choices": [
   "Outputs are probabilistic, so quality must be measured across many cases",
   "LLMs can't run in CI",
   "Unit tests are deprecated"
  ],
  "answer": "Outputs are probabilistic, so quality must be measured across many cases",
  "why": "You track score distributions over a test suite, not one assertion",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "To cut hallucinations in a domain assistant, the highest-leverage fix is usually…",
  "choices": [
   "Grounding answers in retrieved source documents",
   "A bigger context window",
   "Higher temperature"
  ],
  "answer": "Grounding answers in retrieved source documents",
  "why": "Give the model the facts and instruct it to answer only from them: that's RAG",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "Greedy decoding vs sampling:",
  "choices": [
   "Greedy always takes the top token; sampling draws from the distribution",
   "They are identical",
   "Greedy needs more VRAM"
  ],
  "answer": "Greedy always takes the top token; sampling draws from the distribution",
  "why": "Greedy is deterministic and safe; sampling buys diversity at the cost of variance",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "Fine-tuning beats prompting when…",
  "choices": [
   "You need consistent style or behavior at scale that prompting can't reliably hold",
   "You have zero examples",
   "The prompt is already short"
  ],
  "answer": "You need consistent style or behavior at scale that prompting can't reliably hold",
  "why": "Prompting is cheap and flexible; fine-tune when instructions stop being enough",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "A 'stop sequence' does what?",
  "choices": [
   "Tells generation to halt when a given string appears",
   "Deletes the context",
   "Restarts the server"
  ],
  "answer": "Tells generation to halt when a given string appears",
  "why": "It's how you keep the model from rambling past the answer you wanted",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "Caching a long, stable prompt prefix helps because…",
  "choices": [
   "The provider can reuse computation for repeated identical context",
   "It trains the model on your data",
   "It shortens the output"
  ],
  "answer": "The provider can reuse computation for repeated identical context",
  "why": "Same prefix, same computation: caching it cuts latency and cost on every call",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "RAG stands for…",
  "choices": [
   "Retrieval-Augmented Generation",
   "Random Answer Generator",
   "Recursive Agent Graph"
  ],
  "answer": "Retrieval-Augmented Generation",
  "why": "Retrieve relevant documents, then generate an answer grounded in them",
  "difficulty": "easy",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "The core idea of RAG is…",
  "choices": [
   "Fetch relevant documents and let the model answer from them",
   "Train a new model for every question",
   "Cache old answers"
  ],
  "answer": "Fetch relevant documents and let the model answer from them",
  "why": "The LLM stops guessing from memory and starts citing your corpus",
  "difficulty": "easy",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "RAG beats fine-tuning for fresh knowledge because…",
  "choices": [
   "You update the index, not the model weights",
   "It uses no compute at all",
   "It removes the LLM entirely"
  ],
  "answer": "You update the index, not the model weights",
  "why": "New document? Re-embed it tonight. No retraining, no new model",
  "difficulty": "easy",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Chunking is…",
  "choices": [
   "Splitting documents into retrievable pieces",
   "Deleting stopwords",
   "Compressing embeddings"
  ],
  "answer": "Splitting documents into retrievable pieces",
  "why": "Retrieval works on chunks, so how you cut documents shapes everything downstream",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Chunks that are too large hurt retrieval because…",
  "choices": [
   "The relevant sentence gets buried, diluting the chunk's embedding",
   "They cost no tokens",
   "Vector stores reject them"
  ],
  "answer": "The relevant sentence gets buried, diluting the chunk's embedding",
  "why": "One embedding must summarize the whole chunk; noise drowns the signal",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Chunks that are too small hurt because…",
  "choices": [
   "They lose the surrounding context needed to answer",
   "They embed too fast",
   "They can't be stored"
  ],
  "answer": "They lose the surrounding context needed to answer",
  "why": "A lone sentence may match the query but lack the answer around it",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Chunk overlap exists to…",
  "choices": [
   "Avoid cutting an idea in half at a chunk boundary",
   "Double the database size on purpose",
   "Speed up embedding"
  ],
  "answer": "Avoid cutting an idea in half at a chunk boundary",
  "why": "Overlapping windows keep boundary-straddling facts intact in at least one chunk",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "An embedding model in RAG converts…",
  "choices": [
   "Text into vectors so similarity can be computed",
   "Vectors into images",
   "Questions into SQL"
  ],
  "answer": "Text into vectors so similarity can be computed",
  "why": "Query and chunks land in the same vector space; close means relevant",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "A vector store's job is…",
  "choices": [
   "Store embeddings and find nearest neighbors fast",
   "Host the LLM",
   "Version control for code"
  ],
  "answer": "Store embeddings and find nearest neighbors fast",
  "why": "It answers 'which chunks are closest to this query vector' at scale",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Cosine similarity measures…",
  "choices": [
   "The angle between two vectors, ignoring their length",
   "Vector file size",
   "Token count"
  ],
  "answer": "The angle between two vectors, ignoring their length",
  "why": "Direction encodes meaning; cosine compares direction regardless of magnitude",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "top-k in retrieval means…",
  "choices": [
   "Return the k most similar chunks",
   "Keep k databases",
   "Use the model's k-th layer"
  ],
  "answer": "Return the k most similar chunks",
  "why": "k controls how much material you hand the LLM: too few misses, too many dilutes",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "The query and the documents must be embedded with…",
  "choices": [
   "The same or aligned embedding model",
   "Two unrelated models",
   "No model at all"
  ],
  "answer": "The same or aligned embedding model",
  "why": "Different models produce incompatible spaces; distances between them are meaningless",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "BM25 is…",
  "choices": [
   "A keyword-based sparse ranking function built on term frequency",
   "A neural embedding model",
   "A GPU benchmark"
  ],
  "answer": "A keyword-based sparse ranking function built on term frequency",
  "why": "It's the classic lexical search baseline: no neural net involved",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Hybrid retrieval combines…",
  "choices": [
   "Dense vector similarity with sparse keyword scores",
   "Two LLMs",
   "Training and inference"
  ],
  "answer": "Dense vector similarity with sparse keyword scores",
  "why": "Dense catches paraphrase, sparse catches exact terms; together they cover both",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Dense retrieval beats keyword search when…",
  "choices": [
   "The query uses different words than the document, like synonyms or paraphrase",
   "The query quotes the document exactly",
   "The corpus is tiny"
  ],
  "answer": "The query uses different words than the document, like synonyms or paraphrase",
  "why": "Embeddings match meaning, not spelling, so wording mismatches still retrieve",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Keyword (sparse) search still wins when…",
  "choices": [
   "Exact terms matter, like part numbers, error codes, or rare names",
   "Queries are vague",
   "Documents are long"
  ],
  "answer": "Exact terms matter, like part numbers, error codes, or rare names",
  "why": "Embeddings blur rare exact strings that BM25 matches literally",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "A reranker does what?",
  "choices": [
   "Re-scores the retrieved candidates with a stronger, often cross-encoder, model",
   "Rebuilds the index nightly",
   "Shuffles results for fairness"
  ],
  "answer": "Re-scores the retrieved candidates with a stronger, often cross-encoder, model",
  "why": "Cheap retrieval casts a wide net; the reranker reads query and chunk together to reorder it",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Recall@k measures…",
  "choices": [
   "Whether the relevant document appears in the top k results",
   "Answer fluency",
   "Tokens per second"
  ],
  "answer": "Whether the relevant document appears in the top k results",
  "why": "If retrieval can't surface the right chunk in the top k, the LLM never sees it",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Groundedness (faithfulness) in RAG evaluation asks…",
  "choices": [
   "Is the answer actually supported by the retrieved sources?",
   "Is the answer long enough?",
   "Was retrieval fast?"
  ],
  "answer": "Is the answer actually supported by the retrieved sources?",
  "why": "A fluent answer that isn't in the sources is a hallucination wearing citations",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Your RAG bot answers fluently but wrong, and the retrieved chunks don't contain the answer. The failure is in…",
  "choices": [
   "Retrieval",
   "The LLM's grammar",
   "The GPU"
  ],
  "answer": "Retrieval",
  "why": "Garbage in, confident garbage out: fix search before touching the prompt",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Why include citations to retrieved chunks in RAG answers?",
  "choices": [
   "So claims can be verified against sources, exposing hallucination",
   "To make answers longer",
   "Vector stores require it"
  ],
  "answer": "So claims can be verified against sources, exposing hallucination",
  "why": "Citations make the answer auditable, which is the point of grounding",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Embedding dimension is…",
  "choices": [
   "The length of the vector each text maps to",
   "The number of documents",
   "The chunk size in words"
  ],
  "answer": "The length of the vector each text maps to",
  "why": "384, 768, 1536: more dimensions can carry more nuance but cost more to store and search",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "If your corpus updates daily, your RAG system needs…",
  "choices": [
   "Re-embedding and re-indexing of the changed documents",
   "A full model retrain",
   "Nothing at all"
  ],
  "answer": "Re-embedding and re-indexing of the changed documents",
  "why": "The index is the knowledge; stale index means confidently outdated answers",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Hit rate and MRR in RAG evals measure…",
  "choices": [
   "How well retrieval places the right document near the top",
   "LLM training loss",
   "Chunk compression ratio"
  ],
  "answer": "How well retrieval places the right document near the top",
  "why": "MRR rewards ranking the relevant chunk first, not just somewhere in top k",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "SQL: SELECT does what?",
  "choices": [
   "Retrieves rows and columns from a table",
   "Deletes the table",
   "Creates a backup"
  ],
  "answer": "Retrieves rows and columns from a table",
  "why": "SELECT is the read operation: pick columns, FROM says which table",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "SQL: the WHERE clause…",
  "choices": [
   "Filters rows by a condition",
   "Sorts the results",
   "Renames columns"
  ],
  "answer": "Filters rows by a condition",
  "why": "WHERE keeps only rows where the condition is true",
  "difficulty": "easy",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "SQL: an INNER JOIN returns…",
  "choices": [
   "Only rows with matching keys in both tables",
   "All rows from both tables regardless of match",
   "Only the left table's rows"
  ],
  "answer": "Only rows with matching keys in both tables",
  "why": "No match, no row: inner join is the intersection on the join key",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "SQL: a LEFT JOIN returns…",
  "choices": [
   "All left-table rows, with NULLs where the right table has no match",
   "Only the matching rows",
   "Only right-table rows"
  ],
  "answer": "All left-table rows, with NULLs where the right table has no match",
  "why": "Left join preserves the left side; missing matches come back as NULLs",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "SQL: GROUP BY is used to…",
  "choices": [
   "Aggregate rows that share a value, with COUNT, SUM or AVG",
   "Sort rows alphabetically",
   "Join two tables"
  ],
  "answer": "Aggregate rows that share a value, with COUNT, SUM or AVG",
  "why": "Group first, then aggregate within each group",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "SQL: HAVING differs from WHERE because…",
  "choices": [
   "HAVING filters after aggregation, WHERE filters rows before it",
   "They are interchangeable",
   "HAVING only works on text columns"
  ],
  "answer": "HAVING filters after aggregation, WHERE filters rows before it",
  "why": "You can't WHERE on COUNT(*): filter groups with HAVING",
  "difficulty": "hard",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "K-means requires you to choose…",
  "choices": [
   "The number of clusters k in advance",
   "The cluster labels",
   "The tree depth"
  ],
  "answer": "The number of clusters k in advance",
  "why": "k is a hyperparameter you set; picking it well is half the work",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "K-means assigns each point to…",
  "choices": [
   "The nearest cluster centroid",
   "A random cluster",
   "The largest cluster"
  ],
  "answer": "The nearest cluster centroid",
  "why": "Assign to nearest centroid, recompute centroids, repeat until stable",
  "difficulty": "medium",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "HDBSCAN improves on K-means for messy real data because…",
  "choices": [
   "It finds variable-density clusters and labels outliers as noise, without fixing k",
   "It is always faster",
   "It requires labeled data"
  ],
  "answer": "It finds variable-density clusters and labels outliers as noise, without fixing k",
  "why": "Density-based clustering handles odd shapes and noise that K-means forces into clusters",
  "difficulty": "hard",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "UMAP is used to…",
  "choices": [
   "Project high-dimensional data to 2-3 dimensions while preserving local structure",
   "Train classifiers",
   "Impute missing values"
  ],
  "answer": "Project high-dimensional data to 2-3 dimensions while preserving local structure",
  "why": "It's a dimensionality-reduction tool: great for visualizing clusters in embeddings",
  "difficulty": "hard",
  "category": "CIRC",
  "skin": "both"
 },
 {
  "question": "Cohen's kappa measures…",
  "choices": [
   "Agreement between two raters beyond what chance would produce",
   "Raw percent agreement",
   "Model inference speed"
  ],
  "answer": "Agreement between two raters beyond what chance would produce",
  "why": "Kappa corrects agreement for the chance level implied by the label distribution",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Kappa can be low even when raw agreement is high when…",
  "choices": [
   "One class dominates, so chance agreement is already high",
   "The raters are experts",
   "The dataset is small"
  ],
  "answer": "One class dominates, so chance agreement is already high",
  "why": "At 95% majority class, two coin-flippers 'agree' a lot: kappa exposes that",
  "difficulty": "hard",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "A ground-truth set is…",
  "choices": [
   "Human-verified labels used as the reference for evaluation",
   "The model's own predictions",
   "The largest class in the data"
  ],
  "answer": "Human-verified labels used as the reference for evaluation",
  "why": "Evaluation is only as good as the reference labels you score against",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "In a confusion matrix, a false positive is…",
  "choices": [
   "Predicted positive, actually negative",
   "Predicted negative, actually positive",
   "Any correct prediction"
  ],
  "answer": "Predicted positive, actually negative",
  "why": "The model raised its hand and was wrong: prediction positive, truth negative",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Macro-F1 differs from micro-F1 in that macro…",
  "choices": [
   "Averages F1 per class equally, so rare classes count as much as common ones",
   "Weights classes by their size",
   "Ignores small classes"
  ],
  "answer": "Averages F1 per class equally, so rare classes count as much as common ones",
  "why": "Macro treats every class as equally important; micro pools all decisions",
  "difficulty": "hard",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "The bootstrap estimates uncertainty by…",
  "choices": [
   "Resampling the data with replacement many times and recomputing the statistic",
   "Training a bigger model",
   "Deleting outliers"
  ],
  "answer": "Resampling the data with replacement many times and recomputing the statistic",
  "why": "The spread across resamples approximates the sampling distribution",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Always compare a model against a simple baseline because…",
  "choices": [
   "A trivial rule like majority-class may already score deceptively well",
   "Baselines make training faster",
   "It doubles the dataset"
  ],
  "answer": "A trivial rule like majority-class may already score deceptively well",
  "why": "If your model barely beats 'always predict the mean', it isn't learning much",
  "difficulty": "medium",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "Reasonable first moves against heavy class imbalance:",
  "choices": [
   "Resample or reweight classes, and pick metrics suited to imbalance",
   "Always drop the minority class",
   "Raise the learning rate"
  ],
  "answer": "Resample or reweight classes, and pick metrics suited to imbalance",
  "why": "Fix the training signal and the measurement; accuracy alone will lie to you",
  "difficulty": "hard",
  "category": "COND",
  "skin": "both"
 },
 {
  "question": "A PyTorch tensor is…",
  "choices": [
   "An n-dimensional array that can live on CPU or GPU and track gradients",
   "A database table",
   "A Python dictionary"
  ],
  "answer": "An n-dimensional array that can live on CPU or GPU and track gradients",
  "why": "Tensors are the core data structure: numpy arrays with autograd and device placement",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "A DataLoader's job is…",
  "choices": [
   "Serve the dataset in shuffled mini-batches during training",
   "Compute the loss",
   "Store checkpoints"
  ],
  "answer": "Serve the dataset in shuffled mini-batches during training",
  "why": "It wraps a Dataset and handles batching, shuffling and parallel loading",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "optimizer.zero_grad() exists because…",
  "choices": [
   "Gradients accumulate by default, so you clear them before each backward pass",
   "It resets the weights",
   "It frees the GPU permanently"
  ],
  "answer": "Gradients accumulate by default, so you clear them before each backward pass",
  "why": "Skip it and every step applies the sum of all past gradients",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "The canonical training-loop order is…",
  "choices": [
   "forward, then loss, then backward, then optimizer step",
   "backward, then forward, then loss",
   "loss, then forward, then step"
  ],
  "answer": "forward, then loss, then backward, then optimizer step",
  "why": "Predict, measure, differentiate, update: in that order, every batch",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "model.eval() before validation…",
  "choices": [
   "Switches layers like dropout and batchnorm to inference behavior",
   "Freezes the weights forever",
   "Deletes the optimizer"
  ],
  "answer": "Switches layers like dropout and batchnorm to inference behavior",
  "why": "Pair it with torch.no_grad(); switch back with model.train()",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "'Overfit a single batch first' is a debugging trick because…",
  "choices": [
   "If the model can't memorize one batch, the training loop itself is broken",
   "It trains faster in production",
   "It prevents overfitting"
  ],
  "answer": "If the model can't memorize one batch, the training loop itself is broken",
  "why": "Loss should crash to near zero on one batch; if not, fix the plumbing before scaling",
  "difficulty": "hard",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "First fixes for 'CUDA out of memory':",
  "choices": [
   "Smaller batch size, smaller model, or lower precision",
   "More epochs",
   "A higher learning rate"
  ],
  "answer": "Smaller batch size, smaller model, or lower precision",
  "why": "Memory scales with batch and model size; 8 GB cards live on small batches and quantization",
  "difficulty": "medium",
  "category": "GRND",
  "skin": "both"
 },
 {
  "question": "When an LLM must return JSON, robust pipelines…",
  "choices": [
   "Validate against a schema and retry or repair on failure",
   "Trust the first output",
   "Parse it with regex only"
  ],
  "answer": "Validate against a schema and retry or repair on failure",
  "why": "Models occasionally break format; validation plus retry makes it dependable",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "An agent loop needs an explicit stop condition because…",
  "choices": [
   "Otherwise the model can keep calling tools indefinitely, burning tokens",
   "Loops are forbidden by APIs",
   "Tools expire after one call"
  ],
  "answer": "Otherwise the model can keep calling tools indefinitely, burning tokens",
  "why": "Cap iterations or require a final-answer action: agents need brakes",
  "difficulty": "medium",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "Batching requests to a model server improves…",
  "choices": [
   "Throughput, at some cost to per-request latency",
   "Accuracy",
   "The model's weights"
  ],
  "answer": "Throughput, at some cost to per-request latency",
  "why": "Serving is a throughput-latency tradeoff; batches amortize compute",
  "difficulty": "hard",
  "category": "DIST",
  "skin": "both"
 },
 {
  "question": "The two phases of a RAG system are…",
  "choices": [
   "Indexing (chunk, embed, store) and querying (retrieve, generate)",
   "Training and testing",
   "Compiling and linking"
  ],
  "answer": "Indexing (chunk, embed, store) and querying (retrieve, generate)",
  "why": "Build the searchable index offline; retrieve and generate at question time",
  "difficulty": "medium",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "Metadata filtering in a vector store lets you…",
  "choices": [
   "Restrict similarity search to documents matching fields like source or date",
   "Compress the vectors",
   "Skip the embedding step"
  ],
  "answer": "Restrict similarity search to documents matching fields like source or date",
  "why": "Filter first, then rank by similarity: scoped retrieval beats corpus-wide guessing",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "both"
 },
 {
  "question": "RAG is the wrong tool when…",
  "choices": [
   "The task needs pure reasoning or style transformation, not external facts",
   "Documents update often",
   "The corpus is large"
  ],
  "answer": "The task needs pure reasoning or style transformation, not external facts",
  "why": "Retrieval helps when the answer lives in documents; it can't add logic the model lacks",
  "difficulty": "hard",
  "category": "OCP",
  "skin": "both"
 }
];
