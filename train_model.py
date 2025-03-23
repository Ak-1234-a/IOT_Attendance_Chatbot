import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
import deeplake
import numpy as np
import cv2
from tqdm import tqdm  # ✅ Display Progress Bar

# ✅ Load FER2013 Dataset
train_ds = deeplake.load("hub://activeloop/fer2013-train")
val_ds = deeplake.load("hub://activeloop/fer2013-public-test")

# ✅ Convert dataset into NumPy arrays
def prepare_data(ds):
    images = []
    labels = []
    
    print("🔄 Preparing Dataset...")
    for img, label in tqdm(zip(ds["images"], ds["labels"]), total=len(ds["images"])):
        img_resized = cv2.resize(img.numpy(), (48, 48))
        images.append(img_resized)
        labels.append(label.numpy())

    images = np.array(images).reshape(-1, 48, 48, 1) / 255.0  # Normalize
    labels = np.array(labels)
    
    return images, labels

X_train, y_train = prepare_data(train_ds)
X_val, y_val = prepare_data(val_ds)

# ✅ Build CNN Model
model = Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=(48, 48, 1)),
    MaxPooling2D(2,2),
    Conv2D(64, (3,3), activation='relu'),
    MaxPooling2D(2,2),
    Flatten(),
    Dense(128, activation='relu'),
    Dropout(0.3),
    Dense(7, activation='softmax')  # 7 Emotion Classes
])

# ✅ Compile Model
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# ✅ Train Model with Progress Bar
print("\n🚀 Training Model...")
history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=10,
    batch_size=64,
    verbose=1  # ✅ Shows real-time progress
)

# ✅ Save Model
model.save("model/emotion_model.keras")
print("\n✅ Model training completed & saved!")
