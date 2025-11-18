import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import dogImg from "../assets/dog.jpg";
import catImg from "../assets/cat.jpg";
import horseImg from "../assets/horse.jpg";
import birdImg from "../assets/bird.jpg";

interface CaptchaImage {
  url: string;
  correct: boolean;
}

interface ImageCaptchaProps {
  onVerify: (isVerified: boolean) => void;
}

function ImageCaptcha({ onVerify }: ImageCaptchaProps) {
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [verified, setVerified] = useState<boolean | null>(null);

  const images: CaptchaImage[] = [
    { url: dogImg, correct: true },
    { url: catImg, correct: false },
    { url: dogImg, correct: true },
    { url: horseImg, correct: false },
    { url: dogImg, correct: true },
    { url: birdImg, correct: false },
    { url: dogImg, correct: true },
    { url: catImg, correct: false },
    { url: dogImg, correct: true },
  ];

  const toggleImage = (index: number): void => {
    setSelectedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const verifyCaptcha = (): void => {
    const correctIndexes: number[] = images
      .map((img, idx) => (img.correct ? idx : null))
      .filter((idx): idx is number => idx !== null);

    const isValid: boolean =
      correctIndexes.length === selectedIndexes.length &&
      correctIndexes.every((idx) => selectedIndexes.includes(idx));

    setVerified(isValid);
    onVerify(isValid); // Notify parent component
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card shadow">
            <div className="card-body">
              <h6 className="card-title text-center mb-3">
                Select all images with dogs
              </h6>

              <div className="row g-2 mb-3">
                {images.map((img, idx) => (
                  <div key={idx} className="col-4">
                    <div
                      className={`border rounded overflow-hidden position-relative ${
                        selectedIndexes.includes(idx)
                          ? "border-primary border-3"
                          : "border-secondary"
                      }`}
                      style={{
                        cursor: "pointer",
                        aspectRatio: "1",
                        transition: "all 0.2s",
                      }}
                      onClick={() => toggleImage(idx)}
                    >
                      <img
                        src={img.url}
                        alt={`Option ${idx + 1}`}
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                      {selectedIndexes.includes(idx) && (
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary bg-opacity-25" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary w-100 mb-2"
                onClick={verifyCaptcha}
              >
                Verify
              </button>

              {verified !== null && (
                <div
                  className={`alert ${
                    verified ? "alert-success" : "alert-danger"
                  } mb-0`}
                >
                  {verified ? "✓ Verified!" : "✗ Try again"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageCaptcha;
