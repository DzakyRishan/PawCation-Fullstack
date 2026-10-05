import tensorflow as tf
from tensorflow.keras.preprocessing import image_dataset_from_directory
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, RandomFlip, RandomRotation, RandomZoom, Dropout
from tensorflow.keras.models import Model, Sequential
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping

# 1. Siapkan Dataset
BATCH_SIZE = 32
IMG_SIZE = (224, 224)
DATASET_DIR = DATASET_DIR = "Pet_Breeds"

print("Membaca dataset...")
train_dataset = image_dataset_from_directory(
    DATASET_DIR, validation_split=0.2, subset="training",
    seed=123, image_size=IMG_SIZE, batch_size=BATCH_SIZE
)

val_dataset = image_dataset_from_directory(
    DATASET_DIR, validation_split=0.2, subset="validation",
    seed=123, image_size=IMG_SIZE, batch_size=BATCH_SIZE
)

class_names = train_dataset.class_names

# --- JURUS 1: DATA AUGMENTATION ---
# Memperbanyak variasi data secara otomatis
data_augmentation = Sequential([
  RandomFlip("horizontal"),
  RandomRotation(0.1),
  RandomZoom(0.1),
])

# 2. Bangun Otak AI (Transfer Learning MobileNetV2)
base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights='imagenet')
base_model.trainable = False 

# --- JURUS 2: MERAKIT MODEL PRO ---
inputs = tf.keras.Input(shape=(224, 224, 3))
x = data_augmentation(inputs) # Putar/Zoom foto
x = tf.keras.applications.mobilenet_v2.preprocess_input(x) # Bumbu Rahasia MobileNetV2
x = base_model(x, training=False)
x = GlobalAveragePooling2D()(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.5)(x) # Cegah AI menghafal (Overfitting)
predictions = Dense(len(class_names), activation='softmax')(x)

model = Model(inputs=inputs, outputs=predictions)

# 3. Kompilasi Model
model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

# --- JURUS 3: AUTO-STOP & AUTO-SAVE ---
checkpoint_callback = ModelCheckpoint(
    filepath="model_ras_hewan_terbaik.h5", 
    save_best_only=True, 
    monitor="val_accuracy",
    verbose=1
)

early_stop = EarlyStopping(
    monitor='val_accuracy', 
    patience=5, # Kalau 5 putaran berturut-turut akurasi tidak naik, STOP!
    restore_best_weights=True
)

# 4. Mulai Eksekusi Training!
print("Mulai proses training AI Versi PRO...")
EPOCHS = 40 
history = model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=EPOCHS,
    callbacks=[checkpoint_callback, early_stop] 
)

print("✅ Training selesai dan model terbaik sudah disimpan!")